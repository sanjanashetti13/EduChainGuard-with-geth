import React from "react";
import { Link2 } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "components/ui/select";
import { useChainMode } from "contexts/ChainModeContext";
import { SUPPORTED_CHAINS, type ChainMode } from "lib/chains";
import { cn } from "lib/utils";

type ChainModeSwitcherProps = {
  className?: string;
  compact?: boolean;
};

export default function ChainModeSwitcher({
  className,
  compact = false,
}: ChainModeSwitcherProps) {
  const { mode, setMode } = useChainMode();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {!compact && (
        <span className="hidden text-xs font-medium text-muted-foreground lg:inline">
          Network
        </span>
      )}
      <Select value={mode} onValueChange={(v) => setMode(v as ChainMode)}>
        <SelectTrigger
          className={cn(
            "h-9 gap-2 border-border bg-background",
            compact ? "w-[140px]" : "w-[180px]"
          )}
          aria-label="Certificate network mode"
        >
          <Link2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <SelectValue placeholder="Select network" />
        </SelectTrigger>
        <SelectContent>
          {SUPPORTED_CHAINS.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.label} ({c.chainIdDecimal})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
