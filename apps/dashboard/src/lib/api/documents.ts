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
  };
  uploadUrl: string;
};

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
    const { document, uploadUrl } = await documentsApi.createUploadUrl({
      originalName: file.name,
      contentType: file.type || "application/octet-stream",
      size: file.size,
    });

    await documentsApi.uploadToPresignedUrl(
      uploadUrl,
      file,
      onUploadProgress,
    );
    await documentsApi.complete(document.id);
    return document;
  },
};
