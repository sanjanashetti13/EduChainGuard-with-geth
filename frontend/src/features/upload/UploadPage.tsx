import React, { useEffect, useMemo, useState } from "react";
import { Loader2, Upload } from "lucide-react";

import FileInfoCard from "components/domain/FileInfoCard";
import HashPreviewCard from "components/domain/HashPreviewCard";
import TransactionStatusCard from "components/domain/TransactionStatusCard";
import UploadDropzone from "components/domain/UploadDropzone";
import VerificationHistoryTable, {
  type VerificationHistoryRow,
} from "components/domain/VerificationHistoryTable";
import { Alert, AlertDescription, AlertTitle } from "components/ui/alert";
import { Button } from "components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "components/ui/card";
import { useChainMode } from "contexts/ChainModeContext";
import { useChainStatus } from "hooks/useChainStatus";
import { useAuth } from "hooks/useAuth";
import {
  useCertificateUploadMutation,
  useInstituteUploadHistory,
} from "./hooks";

export default function UploadPage() {
  const { user } = useAuth();
  const { mode, chain } = useChainMode();
  const { isHealthy, statusLabel } = useChainStatus();

  const [file, setFile] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<{
    hashHex: string;
    txHash: string;
    dbWarning?: string;
    message?: string;
  } | null>(null);

  const uploadMutation = useCertificateUploadMutation();
  const historyQuery = useInstituteUploadHistory(user?.email);

  const accept =
    mode === "polygon-amoy" ? "application/pdf" : "application/pdf,image/*";
  const dropHint =
    mode === "polygon-amoy"
      ? "PDF only · signed by Flask on Polygon Amoy"
      : "PDF or image · signed via MetaMask on Local Geth";

  useEffect(() => {
    if (!file) {
      setPreviewURL(null);
      return undefined;
    }
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewURL(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewURL(null);
    return undefined;
  }, [file]);

  const historyRows: VerificationHistoryRow[] = useMemo(() => {
    const raw = historyQuery.data;
    if (!Array.isArray(raw)) return [];
    return raw.map((item: Record<string, unknown>) => ({
      hash: String(item.hash ?? ""),
      verified: true,
      timestamp: item.timestamp as string | undefined,
      filename: item.filename as string | undefined,
      tx_hash: item.tx_hash as string | undefined,
    }));
  }, [historyQuery.data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user?.email) return;

    setLastResult(null);
    uploadMutation.mutate(
      { file, email: user.email },
      {
        onSuccess: (data) => {
          setLastResult(data);
          setFile(null);
        },
      }
    );
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-6 sm:px-6 lg:py-8">
      <header className="space-y-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Upload certificate
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Anchor an academic certificate by storing its SHA-256 hash on-chain.
            Use the network selector in the top bar — Geth uses MetaMask; Amoy uses
            the server wallet.
          </p>
        </div>

        {!isHealthy && mode === "geth-local" && (
          <Alert variant="destructive">
            <AlertTitle>Wallet not ready</AlertTitle>
            <AlertDescription>{statusLabel}</AlertDescription>
          </Alert>
        )}
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Certificate file</CardTitle>
            <CardDescription>{dropHint}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <UploadDropzone
              file={file}
              onFileSelect={setFile}
              accept={accept}
              disabled={uploadMutation.isPending}
              loading={uploadMutation.isPending}
              hint={dropHint}
            />

            {file && (
              <FileInfoCard file={file} previewUrl={previewURL} />
            )}

            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={!file || uploadMutation.isPending || !user?.email}
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading…
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload to {chain.shortLabel}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </form>

      {(uploadMutation.isPending || lastResult) && (
        <div className="space-y-4">
          {uploadMutation.isPending && (
            <TransactionStatusCard
              status="pending"
              chain={chain}
              message="Waiting for blockchain confirmation…"
            />
          )}
          {lastResult && !uploadMutation.isPending && (
            <>
              <TransactionStatusCard
                status={uploadMutation.isError ? "error" : "success"}
                txHash={lastResult.txHash}
                chain={chain}
                message={lastResult.message ?? "Certificate hash stored on-chain."}
                dbWarning={lastResult.dbWarning}
              />
              <HashPreviewCard hash={lastResult.hashHex} />
            </>
          )}
        </div>
      )}

      <VerificationHistoryTable
        title="Your uploads"
        rows={historyRows}
        loading={historyQuery.isLoading}
        error={
          historyQuery.isError
            ? "Could not load upload history."
            : null
        }
        emptyMessage="No uploads recorded for your institute account yet."
      />
    </div>
  );
}
