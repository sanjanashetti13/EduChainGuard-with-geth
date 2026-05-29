import { apiRequest } from "./client";
import type { MessageResponse, RecordUploadRequest } from "./types";

export const instituteApi = {
  /**
   * Flask hashes PDF, signs on Amoy, saves to MongoDB.
   * Used when chain mode is polygon-amoy (server-signed).
   */
  uploadPdf: (formData: FormData) =>
    apiRequest<{ message: string; tx_hash: string }>("/institute/upload", {
      method: "POST",
      body: formData,
      rawBody: true,
    }),

  recordUpload: (body: RecordUploadRequest) =>
    apiRequest<MessageResponse>("/institute/record-upload", {
      method: "POST",
      body,
    }),

  getUploads: (email: string) =>
    apiRequest<unknown[]>(`/institute/uploads/${encodeURIComponent(email)}`),
};
