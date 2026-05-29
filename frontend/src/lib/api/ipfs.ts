import { apiRequest } from "./client";
import type { PinataUploadResponse } from "./types";

export const ipfsApi = {
  uploadToPinata: (formData: FormData) =>
    apiRequest<PinataUploadResponse>("/upload-to-pinata", {
      method: "POST",
      body: formData,
      rawBody: true,
    }),
};
