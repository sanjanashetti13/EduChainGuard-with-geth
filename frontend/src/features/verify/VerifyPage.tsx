import React, { useEffect, useState } from "react";
import { Loader2, Shield } from "lucide-react";

import FileInfoCard from "components/domain/FileInfoCard";
import UploadDropzone from "components/domain/UploadDropzone";
import VerificationHistoryTable from "components/domain/VerificationHistoryTable";
import VerificationResultCard from "components/domain/VerificationResultCard";
import { Alert, AlertDescription, AlertTitle } from "components/ui/alert";
import { Button } from "components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "components/ui/card";
import { useChainMode } from "contexts/ChainModeContext";
import { useChainStatus } from "hooks/useChainStatus";
import { useAuth } from "hooks/useAuth";

import {
  useCertificateVerifyMutation,
  useVerifierHistory,
} from "./hooks";

export default function VerifyPage() {
  const { user } = useAuth();
  const { mode, chain } = useChainMode();
  const { isHealthy, statusLabel } = useChainStatus();

  const [file, setFile] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [result, setResult] = useState<{
    verified: boolean;
    hash: string;
    checkedAt: string;
    dbWarning?: string;
  } | null>(null);

  const verifyMutation = useCertificateVerifyMutation();
  const historyQuery = useVerifierHistory(user?.email);

  const accept =
    mode === "polygon-amoy" ? "application/pdf" : "application/pdf,image/*";
  const dropHint =
    mode === "polygon-amoy"
      ? "PDF only · verified via Flask on Polygon Amoy"
      : "PDF or image · verified via MetaMask on Local Geth";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user?.email) return;

    setResult(null);
    verifyMutation.mutate(
      { file, email: user.email },
      {
        onSuccess: (data) => {
          setResult({
            verified: data.verified,
            hash: data.hash,
            checkedAt: new Date().toISOString(),
            dbWarning: data.dbWarning,
          });
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
            Verify certificate
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Upload a certificate file to compare its SHA-256 hash against the
            on-chain registry. Use the network selector in the top bar.
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
            <CardTitle className="text-base">Certificate to verify</CardTitle>
            <CardDescription>{dropHint}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <UploadDropzone
              file={file}
              onFileSelect={(f) => {
                setFile(f);
                setResult(null);
              }}
              accept={accept}
              disabled={verifyMutation.isPending}
              loading={verifyMutation.isPending}
              hint={dropHint}
              id="verify-certificate-file"
            />

            {file && <FileInfoCard file={file} previewUrl={previewURL} />}

            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={!file || verifyMutation.isPending || !user?.email}
            >
              {verifyMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying…
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Verify on {chain.shortLabel}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </form>

      {verifyMutation.isPending && (
        <Card>
          <CardContent className="flex items-center gap-3 py-8 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            Querying CertificateStorage on {chain.label}…
          </CardContent>
        </Card>
      )}

      {result && !verifyMutation.isPending && (
        <div className="space-y-4">
          <VerificationResultCard
            verified={result.verified}
            hash={result.hash}
            chain={chain}
            verifiedAt={result.checkedAt}
          />
          {result.dbWarning && (
            <Alert>
              <AlertTitle>Database sync</AlertTitle>
              <AlertDescription>{result.dbWarning}</AlertDescription>
            </Alert>
          )}
        </div>
      )}

      <VerificationHistoryTable
        title="Your verification history"
        rows={historyQuery.data ?? []}
        loading={historyQuery.isLoading}
        error={
          historyQuery.isError ? "Could not load verification history." : null
        }
        emptyMessage="No verifications logged for your account yet."
      />
    </div>
  );
}
