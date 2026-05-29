import React from "react";
import { ExternalLink, CheckCircle2, AlertCircle, Clock } from "lucide-react";

import { Badge } from "components/ui/badge";
import { Button } from "components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import type { ChainDefinition } from "lib/chains";
import { cn } from "lib/utils";

export type TransactionStatus = "pending" | "success" | "error";

type TransactionStatusCardProps = {
  status: TransactionStatus;
  txHash?: string;
  chain: ChainDefinition;
  message?: string;
  dbWarning?: string;
  className?: string;
};

export default function TransactionStatusCard({
  status,
  txHash,
  chain,
  message,
  dbWarning,
  className,
}: TransactionStatusCardProps) {
  const explorerBase = chain.blockExplorerUrl;

  const StatusIcon =
    status === "success"
      ? CheckCircle2
      : status === "error"
        ? AlertCircle
        : Clock;

  const statusVariant =
    status === "success"
      ? "success"
      : status === "error"
        ? "destructive"
        : "secondary";

  return (
    <Card
      className={cn(
        status === "success" && "border-success/30",
        status === "error" && "border-destructive/30",
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <StatusIcon
              className={cn(
                "h-5 w-5",
                status === "success" && "text-success",
                status === "error" && "text-destructive",
                status === "pending" && "text-muted-foreground animate-pulse"
              )}
            />
            Transaction
          </CardTitle>
          <Badge variant="outline" className="font-mono text-xs">
            {chain.label} · {chain.chainIdDecimal}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Status</span>
          <Badge variant={statusVariant} className="capitalize">
            {status}
          </Badge>
        </div>

        {message && (
          <p className="text-muted-foreground">{message}</p>
        )}

        {txHash && (
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Transaction hash
            </p>
            <code className="block break-all rounded-md bg-muted px-3 py-2 font-mono text-xs">
              {txHash}
            </code>
            {explorerBase && (
              <Button variant="link" size="sm" className="mt-2 h-auto px-0" asChild>
                <a
                  href={`${explorerBase}/tx/${txHash}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View on explorer
                  <ExternalLink className="ml-1 h-3.5 w-3.5" />
                </a>
              </Button>
            )}
          </div>
        )}

        {dbWarning && (
          <p className="rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning-foreground">
            {dbWarning}
          </p>
        )}

        <p className="text-xs text-muted-foreground">
          {chain.walletSigned
            ? "Signed via MetaMask on your local node."
            : "Signed by the EduChainGuard server on Polygon Amoy."}
        </p>
      </CardContent>
    </Card>
  );
}
