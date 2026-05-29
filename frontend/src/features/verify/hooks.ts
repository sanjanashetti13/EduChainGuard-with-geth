import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { adminApi } from "lib/api";
import { queryKeys } from "lib/query-keys";
import { useChainMode } from "contexts/ChainModeContext";
import { hasMetaMaskProvider } from "utils/blockchain";

import type { VerificationHistoryRow } from "components/domain/VerificationHistoryTable";
import {
  verifyCertificateByMode,
  toVerifyErrorMessage,
  type VerifyResult,
} from "./certificateVerify";

export function useVerifierHistory(email: string | undefined) {
  return useQuery({
    queryKey: queryKeys.verifier.history(email ?? ""),
    queryFn: async (): Promise<VerificationHistoryRow[]> => {
      const res = await adminApi.getVerifierActivity();
      const me = res.verifier.find((v) => v.email === email);
      return (me?.verifications ?? []).map((v) => ({
        hash: v.hash,
        verified: Boolean(v.verified),
        timestamp: v.timestamp,
      }));
    },
    enabled: Boolean(email),
  });
}

export function useCertificateVerifyMutation() {
  const { mode, chain } = useChainMode();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      email,
    }: {
      file: File;
      email: string;
    }): Promise<VerifyResult> => {
      if (mode === "geth-local" && !hasMetaMaskProvider()) {
        throw new Error("METAMASK_MISSING");
      }
      return verifyCertificateByMode(file, email, mode);
    },
    onSuccess: (data) => {
      if (data.dbWarning) {
        toast.info(
          data.verified ? "Certificate verified on chain" : "Hash not registered",
          { description: data.dbWarning }
        );
      } else {
        toast.success(
          data.verified ? "Certificate verified" : "Hash not found on chain",
          { description: `${chain.label} · ${chain.chainIdDecimal}` }
        );
      }
    },
    onError: (error) => {
      toast.error(toVerifyErrorMessage(error));
    },
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.verifier.history(variables.email),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats() });
    },
  });
}
