import React, { useCallback, useEffect, useState } from "react";

import { cn } from "lib/utils";
import {
  connectWallet,
  hasMetaMaskProvider,
  readChainIdHex,
  isLocalGethChain,
} from "utils/blockchain";
import { shortenAddress } from "utils/shortenAddress";

function normalizeAddress(addr) {
  if (addr == null) return null;
  if (typeof addr === "string") return addr.trim() || null;
  return String(addr);
}

/**
 * @param {{ variant?: 'hero' | 'card'; hideHeading?: boolean; className?: string }} props
 */
export default function WalletStatusBlock({
  variant = "hero",
  hideHeading = false,
  className,
}) {
  const isCard = variant === "card";

  const [walletAddress, setWalletAddress] = useState(null);
  const [onLocalGeth, setOnLocalGeth] = useState(false);
  const [walletError, setWalletError] = useState(null);

  const refreshWallet = useCallback(async () => {
    if (!hasMetaMaskProvider()) {
      setWalletAddress(null);
      setOnLocalGeth(false);
      return;
    }
    try {
      const chainHex = await readChainIdHex();
      setOnLocalGeth(isLocalGethChain(chainHex));
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      setWalletAddress(normalizeAddress(accounts?.[0] ?? null));
    } catch {
      setWalletAddress(null);
    }
  }, []);

  useEffect(() => {
    refreshWallet();
  }, [refreshWallet]);

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

  const handleConnect = async () => {
    setWalletError(null);
    try {
      const { address } = await connectWallet();
      setWalletAddress(normalizeAddress(address));
      const chainHex = await readChainIdHex();
      setOnLocalGeth(isLocalGethChain(chainHex));
    } catch (e) {
      setWalletError(
        typeof e?.message === "string" ? e.message : "Could not connect wallet"
      );
    }
  };

  return (
    <div
      className={cn(
        "w-full text-left text-sm",
        isCard
          ? "rounded-xl border border-slate-200 bg-white p-5 shadow-md transition-shadow hover:shadow-lg"
          : "mt-10 max-w-lg rounded-xl border border-white/15 bg-white/5 px-4 py-4 text-slate-200 backdrop-blur-sm",
        className
      )}
    >
      {!hideHeading ? (
        <p
          className={cn(
            "mb-3 text-xs font-bold uppercase tracking-wider",
            isCard ? "text-slate-500" : "text-slate-400"
          )}
        >
          Wallet & network
        </p>
      ) : null}
      {!hasMetaMaskProvider() ? (
        <p className={isCard ? "text-amber-800" : "text-amber-200"}>
          MetaMask not detected. Install the extension to use Local Geth (chain
          1337).
        </p>
      ) : (
        <div className="flex flex-col gap-6 sm:flex-row sm:items-stretch sm:justify-between">
          <div className="space-y-5">
            <div>
              <p className={cn("mb-2 text-[11px] font-bold uppercase tracking-wide", isCard ? "text-neutral-800" : "text-slate-500")}>
                Account
              </p>
              <p
                className={cn(
                  "font-mono text-sm font-semibold",
                  isCard ? "text-neutral-950" : "text-white"
                )}
              >
                {walletAddress ? shortenAddress(walletAddress) : "—"}
              </p>
            </div>
            <div>
              <p className={cn("mb-2 text-[11px] font-bold uppercase tracking-wide", isCard ? "text-neutral-800" : "text-slate-500")}>
                Network
              </p>
              <p
                className={cn(
                  "inline-flex rounded-md px-2 py-1 text-xs font-semibold",
                  onLocalGeth
                    ? isCard
                      ? "bg-emerald-50 text-neutral-900 ring-1 ring-emerald-300"
                      : "text-emerald-300"
                    : isCard
                      ? "bg-amber-50 text-neutral-950 ring-1 ring-amber-300"
                      : "text-amber-200"
                )}
              >
                {onLocalGeth ? "Geth Local · Chain 1337" : "Switch wallet to chain 1337"}
              </p>
            </div>
            {walletError ? (
              <p className={isCard ? "text-sm font-semibold text-red-700" : "text-xs text-red-300"}>
                {walletError}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={handleConnect}
            className={cn(
              "shrink-0 rounded-lg border-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wide transition hover:brightness-[1.02] active:scale-[0.98]",
              isCard
                ? "border-neutral-900 bg-white !text-neutral-900 shadow-sm hover:bg-neutral-100"
                : "bg-white/10 text-white ring-1 ring-white/30 hover:bg-white/20"
            )}
          >
            {walletAddress ? "Reconnect" : "Connect wallet"}
          </button>
        </div>
      )}
    </div>
  );
}
