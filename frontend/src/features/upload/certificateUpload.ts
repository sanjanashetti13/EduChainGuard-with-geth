import { instituteApi } from "lib/api";
import { getErrorMessage } from "lib/api/errors";
import type { ChainMode } from "lib/chains";
import {
  formatBlockchainError,
  hashFileSha256Hex,
  uploadCertificate,
} from "utils/blockchain";

export type UploadResult = {
  hashHex: string;
  txHash: string;
  message?: string;
  dbWarning?: string;
};

export async function uploadCertificateByMode(
  file: File,
  email: string,
  mode: ChainMode
): Promise<UploadResult> {
  if (mode === "polygon-amoy") {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("file", file);

    const res = await instituteApi.uploadPdf(formData);
    const hashHex = await hashFileSha256Hex(file);

    return {
      hashHex,
      txHash: res.tx_hash,
      message: res.message,
    };
  }

  const hashHex = await hashFileSha256Hex(file);
  const { txHash } = await uploadCertificate(hashHex);

  try {
    await instituteApi.recordUpload({
      email,
      tx_hash: txHash,
      hash: hashHex,
      filename: file.name,
    });
  } catch (err) {
    return {
      hashHex,
      txHash,
      dbWarning: getErrorMessage(err),
    };
  }

  return { hashHex, txHash };
}

export function toUploadErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.includes("METAMASK")) {
    return formatBlockchainError(error);
  }
  return getErrorMessage(error);
}
