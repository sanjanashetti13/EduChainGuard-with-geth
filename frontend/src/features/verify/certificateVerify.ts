import { verifierApi } from "lib/api";
import { getErrorMessage } from "lib/api/errors";
import type { ChainMode } from "lib/chains";
import {
  formatBlockchainError,
  hashFileSha256Hex,
  verifyCertificate,
} from "utils/blockchain";

export type VerifyResult = {
  verified: boolean;
  hash: string;
  dbWarning?: string;
};

export async function verifyCertificateByMode(
  file: File,
  email: string,
  mode: ChainMode
): Promise<VerifyResult> {
  if (mode === "polygon-amoy") {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("file", file);

    const res = await verifierApi.verifyPdf(formData);
    return {
      verified: res.verified,
      hash: res.hash,
    };
  }

  const hash = await hashFileSha256Hex(file);
  const verified = await verifyCertificate(hash);

  try {
    await verifierApi.recordVerify({
      email,
      hash,
      verified,
    });
  } catch (err) {
    return {
      verified,
      hash,
      dbWarning: getErrorMessage(err),
    };
  }

  return { verified, hash };
}

export function toVerifyErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.includes("METAMASK")) {
    return formatBlockchainError(error);
  }
  return getErrorMessage(error);
}
