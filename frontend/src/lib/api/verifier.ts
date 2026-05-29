import { apiRequest } from "./client";
import type { MessageResponse, RecordVerifyRequest } from "./types";

export const verifierApi = {
  /**
   * Flask hashes PDF and calls contract on Amoy.
   * Used when chain mode is polygon-amoy (server-signed).
   */
  verifyPdf: (formData: FormData) =>
    apiRequest<{ verified: boolean; hash: string }>("/verifier/verify-pdf", {
      method: "POST",
      body: formData,
      rawBody: true,
    }),

  recordVerify: (body: RecordVerifyRequest) =>
    apiRequest<MessageResponse>("/verifier/record-verify", {
      method: "POST",
      body,
    }),
};
