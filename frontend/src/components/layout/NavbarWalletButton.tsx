import React, { useCallback, useEffect, useState } from "react";
import { Wallet } from "lucide-react";
import { toast } from "sonner";

import { Button } from "components/ui/button";
import { useChainMode } from "contexts/ChainModeContext";
import {
  connectWallet,
  formatBlockchainError,
  hasMetaMaskProvider,
} from "utils/blockchain";
import { shortenAddress } from "utils/shortenAddress";

function normalizeAddress(addr: unknown): string | null {
  if (addr == null) return null;
  if (typeof addr === "string") return addr.trim() || null;
  return String(addr);
}

/**
 * MetaMask connect control for Local Geth mode (uses existing blockchain utils).
 */
export default function NavbarWalletButton() {
  const { mode } = useChainMode();
  const [address, setAddress] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!hasMetaMaskProvider()) {
      setAddress(null);
      return;
    }
    try {
      const accounts = (await window.ethereum.request({
        method: "eth_accounts",
      })) as string[] | undefined;
      setAddress(normalizeAddress(accounts?.[0]));
    } catch {
      setAddress(null);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh, mode]);

  useEffect(() => {
    if (!window.ethereum) return undefined;
    const onChange = () => refresh();
    window.ethereum.on("accountsChanged", onChange);
    window.ethereum.on("chainChanged", onChange);
    return () => {
      window.ethereum.removeListener("accountsChanged", onChange);
      window.ethereum.removeListener("chainChanged", onChange);
    };
  }, [refresh]);

  if (mode !== "geth-local") {
    return null;
  }

  const handleConnect = async () => {
    try {
      const { address: addr } = await connectWallet();
      setAddress(normalizeAddress(addr));
      toast.success("Wallet connected");
    } catch (e) {
      toast.error(formatBlockchainError(e));
    }
  };

  if (!hasMetaMaskProvider()) {
    return (
      <span className="hidden text-xs text-muted-foreground md:inline">
        MetaMask required
      </span>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="hidden gap-2 sm:inline-flex"
      onClick={handleConnect}
    >
      <Wallet className="h-4 w-4" />
      {address ? shortenAddress(address) : "Connect wallet"}
    </Button>
  );
}
