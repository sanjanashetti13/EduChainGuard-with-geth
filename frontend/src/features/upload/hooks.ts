import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { instituteApi } from "lib/api";
import { queryKeys } from "lib/query-keys";
import { useChainMode } from "contexts/ChainModeContext";
import { hasMetaMaskProvider } from "utils/blockchain";

import {
  uploadCertificateByMode,
  toUploadErrorMessage,
  type UploadResult,
} from "./certificateUpload";

export function useInstituteUploadHistory(email: string | undefined) {
  return useQuery({
    queryKey: queryKeys.institute.uploads(email ?? ""),
    queryFn: () => instituteApi.getUploads(email!),
    enabled: Boolean(email),
  });
}

export function useCertificateUploadMutation() {
  const { mode, chain } = useChainMode();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      email,
    }: {
      file: File;
      email: string;
    }): Promise<UploadResult> => {
      if (mode === "geth-local" && !hasMetaMaskProvider()) {
        throw new Error("METAMASK_MISSING");
      }
      if (mode === "polygon-amoy" && !file.name.toLowerCase().endsWith(".pdf")) {
        throw new Error("Polygon Amoy uploads require a PDF file.");
      }
      return uploadCertificateByMode(file, email, mode);
    },
    onSuccess: (data) => {
      if (data.dbWarning) {
        toast.warning("On-chain upload succeeded", {
          description: data.dbWarning,
        });
      } else {
        toast.success("Certificate anchored successfully", {
          description: `${chain.label} · ${chain.chainIdDecimal}`,
        });
      }
    },
    onError: (error) => {
      toast.error(toUploadErrorMessage(error));
    },
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.institute.uploads(variables.email),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats() });
    },
  });
}
