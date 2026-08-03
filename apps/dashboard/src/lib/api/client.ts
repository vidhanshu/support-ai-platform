import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  getWorkspaceId,
  redirectToLogin,
  saveAuthTokens,
  type AuthTokens,
} from "@/lib/auth/tokens";
import { API_BASE_URL, API_HEADERS } from "./constants";
import { ApiError, extractApiErrorMessage } from "./errors";

export type UploadProgress = {
  loaded: number;
  total?: number;
  /** 0–100 */
  percent: number;
};

export type ApiRequestOptions = {
  /** Send Bearer access token. Default: true */
  auth?: boolean;
  /** Send `x-workspace-id`. Default: false */
  workspace?: boolean;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  timeout?: number;
  /** Skip 401 → refresh retry. Used internally for refresh itself. */
  skipRefresh?: boolean;
  onUploadProgress?: (progress: UploadProgress) => void;
  onDownloadProgress?: (progress: UploadProgress) => void;
};

type ApiSuccessEnvelope<T> = {
  success: true;
  data: T;
};

/** Custom flags — do not use Axios' built-in `auth` (basic credentials). */
type AppAxiosConfig = InternalAxiosRequestConfig & {
  skipAuth?: boolean;
  useWorkspace?: boolean;
  skipRefresh?: boolean;
  _retry?: boolean;
};

let refreshPromise: Promise<boolean> | null = null;

function toProgress(event: {
  loaded: number;
  total?: number;
}): UploadProgress {
  const total = event.total && event.total > 0 ? event.total : undefined;
  return {
    loaded: event.loaded,
    total,
    percent: total ? Math.round((event.loaded / total) * 100) : 0,
  };
}

function unwrapResponse<T>(payload: unknown): T {
  if (
    payload &&
    typeof payload === "object" &&
    "success" in payload &&
    (payload as { success?: boolean }).success === true &&
    "data" in payload
  ) {
    return (payload as ApiSuccessEnvelope<T>).data;
  }

  return payload as T;
}

function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    const status = axiosError.response?.status ?? 0;
    const details = axiosError.response?.data;
    const message = extractApiErrorMessage(
      details,
      axiosError.message || "Something went wrong",
    );
    return new ApiError(message, status, details);
  }

  if (error instanceof Error) {
    return new ApiError(error.message, 0);
  }

  return new ApiError("Something went wrong", 0);
}

function endSessionAndRedirectToLogin() {
  clearSession();
  redirectToLogin();
}

async function refreshAccessToken(client: AxiosInstance): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        endSessionAndRedirectToLogin();
        return false;
      }

      try {
        const response = await client.post<unknown>(
          "/auth/refresh",
          { refreshToken },
          {
            skipAuth: true,
            skipRefresh: true,
          } as AppAxiosConfig,
        );
        const tokens = unwrapResponse<AuthTokens>(response.data);
        saveAuthTokens(tokens);
        return true;
      } catch {
        endSessionAndRedirectToLogin();
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}

function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30_000,
    headers: {
      Accept: "application/json",
    },
  });

  client.interceptors.request.use((config: AppAxiosConfig) => {
    const headers = AxiosHeaders.from(config.headers);

    if (
      config.data !== undefined &&
      !(config.data instanceof FormData) &&
      !(config.data instanceof Blob) &&
      !headers.has("Content-Type")
    ) {
      headers.set("Content-Type", "application/json");
    }

    if (!config.skipAuth) {
      const accessToken = getAccessToken();
      if (accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`);
      }
    }

    if (config.useWorkspace) {
      const workspaceId = getWorkspaceId();
      if (workspaceId) {
        headers.set(API_HEADERS.WORKSPACE_ID, workspaceId);
      }
    }

    config.headers = headers;
    return config;
  });

  client.interceptors.response.use(
    (response: AxiosResponse) => {
      if (response.status === 204 || response.data === "") {
        response.data = undefined;
        return response;
      }

      response.data = unwrapResponse(response.data);
      return response;
    },
    async (error: AxiosError) => {
      const config = error.config as AppAxiosConfig | undefined;

      if (
        error.response?.status === 401 &&
        config &&
        !config.skipAuth &&
        !config.skipRefresh &&
        !config._retry
      ) {
        config._retry = true;
        const refreshed = await refreshAccessToken(client);
        if (refreshed) {
          // retrying the original request with refreshed token
          return client.request(config);
        }
      }

      return Promise.reject(toApiError(error));
    },
  );

  return client;
}

const axiosClient = createApiClient();

function buildConfig(
  options: ApiRequestOptions = {},
): AxiosRequestConfig & AppAxiosConfig {
  return {
    skipAuth: options.auth === false,
    useWorkspace: options.workspace === true,
    skipRefresh: options.skipRefresh,
    headers: options.headers,
    signal: options.signal,
    timeout: options.timeout,
    onUploadProgress: options.onUploadProgress
      ? (event) => options.onUploadProgress?.(toProgress(event))
      : undefined,
    onDownloadProgress: options.onDownloadProgress
      ? (event) => options.onDownloadProgress?.(toProgress(event))
      : undefined,
  } as AxiosRequestConfig & AppAxiosConfig;
}

/**
 * Typed HTTP client used by all domain API modules.
 *
 * @example
 * apiClient.get<User>("/auth/me")
 * apiClient.post<Agent>("/agents", body, { workspace: true })
 * apiClient.upload(presignedUrl, file, { onUploadProgress: (p) => ... })
 */
export const apiClient = {
  get: async <T>(path: string, options?: ApiRequestOptions) => {
    const response = await axiosClient.get<T>(path, buildConfig(options));
    return response.data;
  },

  post: async <T>(
    path: string,
    body?: unknown,
    options?: ApiRequestOptions,
  ) => {
    const response = await axiosClient.post<T>(
      path,
      body,
      buildConfig(options),
    );
    return response.data;
  },

  patch: async <T>(
    path: string,
    body?: unknown,
    options?: ApiRequestOptions,
  ) => {
    const response = await axiosClient.patch<T>(
      path,
      body,
      buildConfig(options),
    );
    return response.data;
  },

  put: async <T>(
    path: string,
    body?: unknown,
    options?: ApiRequestOptions,
  ) => {
    const response = await axiosClient.put<T>(path, body, buildConfig(options));
    return response.data;
  },

  delete: async <T>(path: string, options?: ApiRequestOptions) => {
    const response = await axiosClient.delete<T>(path, buildConfig(options));
    return response.data;
  },

  /**
   * Binary upload helper (e.g. MinIO/S3 presigned URL) with progress.
   * No API envelope unwrap. Auth off by default for presigned URLs.
   */
  upload: async <T = void>(
    url: string,
    file: Blob | File,
    options: {
      method?: "PUT" | "POST";
      headers?: Record<string, string>;
      signal?: AbortSignal;
      /** 0 = no timeout (large files). */
      timeout?: number;
      onUploadProgress?: (progress: UploadProgress) => void;
      auth?: boolean;
      workspace?: boolean;
    } = {},
  ) => {
    const {
      method = "PUT",
      headers,
      signal,
      timeout = 0,
      onUploadProgress,
      auth = false,
      workspace = false,
    } = options;

    try {
      const response = await axios.request<T>({
        url,
        method,
        data: file,
        headers: {
          "Content-Type":
            file instanceof File
              ? file.type || "application/octet-stream"
              : "application/octet-stream",
          ...headers,
        },
        signal,
        timeout,
        onUploadProgress: onUploadProgress
          ? (event) => onUploadProgress(toProgress(event))
          : undefined,
      });

      // Optional: if uploading through our own API with envelope later
      if (auth || workspace) {
        return unwrapResponse<T>(response.data);
      }

      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  },
};
