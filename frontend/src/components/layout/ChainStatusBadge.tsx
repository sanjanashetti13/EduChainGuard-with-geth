import React from "react";
import { AlertTriangle, CheckCircle2, Server, Wallet } from "lucide-react";

import { Badge } from "components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "components/ui/tooltip";
import { useChainMode } from "contexts/ChainModeContext";
import { useChainStatus } from "hooks/useChainStatus";
import { cn } from "lib/utils";

type ChainStatusBadgeProps = {
  className?: string;
  showChainId?: boolean;
};

export default function ChainStatusBadge({
  className,
  showChainId = true,
}: ChainStatusBadgeProps) {
  const { chain } = useChainMode();
  const { status, statusLabel, isHealthy } = useChainStatus();

  const Icon =
    status === "server-signing"
      ? Server
      : status === "wallet-ready"
        ? CheckCircle2
        : status === "wallet-missing" || status === "wallet-wrong-network"
          ? AlertTriangle
          : Wallet;

  const variant = isHealthy ? "success" : "warning";

  const tooltip = (
    <div className="space-y-1 text-xs">
      <p className="font-semibold">{chain.label}</p>
      <p>Chain ID: {chain.chainIdDecimal}</p>
      <p className="text-muted-foreground">{statusLabel}</p>
      {chain.serverSigned && (
        <p className="text-muted-foreground">Uploads via Flask + Web3.py</p>
      )}
      {chain.walletSigned && (
        <p className="text-muted-foreground">Uploads via MetaMask</p>
      )}
    </div>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant={variant}
          className={cn(
            "gap-1.5 px-2.5 py-1 font-medium tabular-nums",
            className
          )}
        >
          <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="truncate">
            {chain.shortLabel}
            {showChainId && (
              <span className="opacity-80"> · {chain.chainIdDecimal}</span>
            )}
          </span>
        </Badge>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}
