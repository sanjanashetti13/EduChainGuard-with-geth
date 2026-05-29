import React from "react";
import { ShieldCheck, ShieldX } from "lucide-react";

import { Badge } from "components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import type { ChainDefinition } from "lib/chains";
import HashPreviewCard from "components/domain/HashPreviewCard";
import { cn } from "lib/utils";

type VerificationResultCardProps = {
  verified: boolean;
  hash: string;
  chain: ChainDefinition;
  verifiedAt?: string;
  className?: string;
};

export default function VerificationResultCard({
  verified,
  hash,
  chain,
  verifiedAt,
  className,
}: VerificationResultCardProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <Card
        className={cn(
          "overflow-hidden",
          verified ? "border-success/40" : "border-destructive/40"
        )}
      >
        <CardHeader
          className={cn(
            verified ? "bg-success/10" : "bg-destructive/10"
          )}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              {verified ? (
                <ShieldCheck className="h-6 w-6 text-success" />
              ) : (
                <ShieldX className="h-6 w-6 text-destructive" />
              )}
              {verified ? "Certificate verified" : "Not found on chain"}
            </CardTitle>
            <Badge variant="outline" className="font-mono text-xs">
              {chain.label} · {chain.chainIdDecimal}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-4">
          <p className="text-sm text-muted-foreground">
            {verified
              ? "This file’s SHA-256 hash is registered in CertificateStorage."
              : "No matching hash was found for this file on the selected network."}
          </p>
          {verifiedAt && (
            <p className="text-xs text-muted-foreground">
              Checked at {new Date(verifiedAt).toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>
      <HashPreviewCard hash={hash} />
    </div>
  );
}
