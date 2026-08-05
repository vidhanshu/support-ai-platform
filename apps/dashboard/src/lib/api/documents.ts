import { apiClient, type UploadProgress } from "./client";

export type CreateUploadUrlInput = {
  originalName: string;
  contentType: string;
  size: number;
};

export type CreateUploadUrlResponse = {
  document: {
    id: string;
    objectKey: string;
    originalFilename: string;
    mimeType: string;
    size: number;
    knowledgeSourceId: string;
  };
  /** Absolute MinIO/S3 PUT URL */
  uploadUrl: string;
  expiresIn?: number;
};

function resolvePresignedUploadUrl(uploadUrl: unknown): string {
  if (typeof uploadUrl === "string" && /^https?:\/\//i.test(uploadUrl)) {
    return uploadUrl;
  }

  if (
    uploadUrl &&
    typeof uploadUrl === "object" &&
    "signedUrl" in uploadUrl &&
    typeof (uploadUrl as { signedUrl?: unknown }).signedUrl === "string"
  ) {
    const signedUrl = (uploadUrl as { signedUrl: string }).signedUrl;
    if (/^https?:\/\//i.test(signedUrl)) return signedUrl;
  }

  throw new Error("Invalid presigned upload URL returned by the API");
}

/**
 * Document uploads:
 * 1) `createUploadUrl` → API (auth + workspace)
 * 2) `uploadToPresignedUrl` → MinIO/S3 with progress
 * 3) `complete` → API marks upload done + enqueues processing
 */
export const documentsApi = {
  list: () => apiClient.get<unknown[]>("/documents", { workspace: true }),

  createUploadUrl: (input: CreateUploadUrlInput) =>
    apiClient.post<CreateUploadUrlResponse>("/documents/upload-url", input, {
      workspace: true,
    }),

  complete: (documentId: string) =>
    apiClient.post<unknown>(`/documents/${documentId}/complete`, undefined, {
      workspace: true,
    }),

  uploadToPresignedUrl: (
    uploadUrl: string,
    file: File,
    onUploadProgress?: (progress: UploadProgress) => void,
  ) =>
    apiClient.upload(uploadUrl, file, {
      method: "PUT",
      headers: {
        "Content-Type": file.type || "application/octet-stream",
      },
      onUploadProgress,
    }),

  /** Full flow helper used by UI upload components. */
  upload: async (
    file: File,
    onUploadProgress?: (progress: UploadProgress) => void,
  ) => {
    const payload = await documentsApi.createUploadUrl({
      originalName: file.name,
      contentType: file.type || "application/octet-stream",
      size: file.size,
    });

    const uploadUrl = resolvePresignedUploadUrl(payload.uploadUrl);

    await documentsApi.uploadToPresignedUrl(
      uploadUrl,
      file,
      onUploadProgress,
    );
    await documentsApi.complete(payload.document.id);
    return payload.document;
  },
};
