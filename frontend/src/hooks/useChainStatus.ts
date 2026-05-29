import { useCallback, useEffect, useState } from "react";

import { useChainMode } from "contexts/ChainModeContext";
import { CHAIN_GETH_LOCAL } from "lib/chains";
import {
  hasMetaMaskProvider,
  isLocalGethChain,
  readChainIdHex,
} from "utils/blockchain";

export type ChainConnectionStatus =
  | "server-signing"
  | "wallet-ready"
  | "wallet-wrong-network"
  | "wallet-missing"
  | "wallet-disconnected";

export function useChainStatus() {
  const { mode, chain } = useChainMode();
  const [walletChainHex, setWalletChainHex] = useState<string | null>(null);
  const [hasAccount, setHasAccount] = useState(false);

  const refreshWallet = useCallback(async () => {
    if (!hasMetaMaskProvider()) {
      setWalletChainHex(null);
      setHasAccount(false);
      return;
    }
    try {
      const chainHex = (await readChainIdHex()) as string | null;
      setWalletChainHex((prev) => (prev === chainHex ? prev : chainHex));
      const accounts = (await window.ethereum.request({
        method: "eth_accounts",
      })) as string[] | undefined;
      const connected = Boolean(accounts?.[0]);
      setHasAccount((prev) => (prev === connected ? prev : connected));
    } catch {
      setWalletChainHex(null);
      setHasAccount(false);
    }
  }, []);

  useEffect(() => {
    refreshWallet();
  }, [refreshWallet, mode]);

  useEffect(() => {
    if (!window.ethereum) return undefined;
    const onChange = () => refreshWallet();
    window.ethereum.on("accountsChanged", onChange);
    window.ethereum.on("chainChanged", onChange);
    return () => {
      window.ethereum.removeListener("accountsChanged", onChange);
      window.ethereum.removeListener("chainChanged", onChange);
    };
  }, [refreshWallet]);

  const status: ChainConnectionStatus = (() => {
    if (mode === "polygon-amoy") {
      return "server-signing";
    }
    if (!hasMetaMaskProvider()) {
      return "wallet-missing";
    }
    if (!isLocalGethChain(walletChainHex)) {
      return "wallet-wrong-network";
    }
    if (!hasAccount) {
      return "wallet-disconnected";
    }
    return "wallet-ready";
  })();

  const statusLabel = (() => {
    switch (status) {
      case "server-signing":
        return "Flask signs on Amoy";
      case "wallet-ready":
        return "MetaMask on Geth";
      case "wallet-wrong-network":
        return `Switch to chain ${CHAIN_GETH_LOCAL.chainIdDecimal}`;
      case "wallet-missing":
        return "MetaMask not installed";
      case "wallet-disconnected":
        return "Connect MetaMask";
      default:
        return "";
    }
  })();

  const isHealthy =
    status === "server-signing" || status === "wallet-ready";

  return {
    mode,
    chain,
    status,
    statusLabel,
    isHealthy,
    walletChainHex,
    hasAccount,
    refreshWallet,
  };
}
