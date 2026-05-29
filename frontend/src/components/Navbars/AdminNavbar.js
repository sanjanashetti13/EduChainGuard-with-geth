import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import UserDropdown from "../Dropdowns/UserDropdown";
import BackButton from "components/ui/BackButton";
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

export default function Navbar() {
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
      const first = accounts?.[0] ?? null;
      setWalletAddress(normalizeAddress(first));
    } catch {
      setWalletAddress(null);
    }
  }, []);

  useEffect(() => {
    refreshWallet();
  }, [refreshWallet]);

  useEffect(() => {
    if (!window.ethereum) return undefined;
    const onAccounts = () => refreshWallet();
    const onChain = () => refreshWallet();
    window.ethereum.on("accountsChanged", onAccounts);
    window.ethereum.on("chainChanged", onChain);
    return () => {
      window.ethereum.removeListener("accountsChanged", onAccounts);
      window.ethereum.removeListener("chainChanged", onChain);
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
    <nav className="absolute left-0 right-0 top-0 z-30 box-border max-w-full overflow-x-hidden border-b border-blueGray-200 bg-white shadow-sm">
      <div className="mx-auto box-border w-full max-w-full min-w-0 px-4 pb-3 pt-3 md:px-8 lg:px-10">
        {/* Row 1: stays in viewport via wrap + max-width constraints */}
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
            <Link
              to="/"
              className="hidden shrink-0 text-xs font-bold uppercase tracking-wide text-blueGray-800 transition hover:text-blueGray-950 sm:inline"
            >
              Home
            </Link>
            <Link
              to="/admin/dashboard"
              className="hidden shrink-0 text-xs font-bold uppercase tracking-wide text-blueGray-800 transition hover:text-blueGray-950 md:inline"
            >
              Dashboard
            </Link>
            <BackButton
              label="Back"
              className="border-blueGray-300 bg-white text-blueGray-800 shadow-sm hover:border-blueGray-400 hover:bg-blueGray-50 hover:text-blueGray-900"
            />
          </div>

          <ul className="m-0 flex max-w-full min-w-0 list-none flex-wrap items-center justify-end gap-2 sm:gap-3">
            {!hasMetaMaskProvider() ? (
              <li className="max-w-[min(100vw-8rem,20rem)] text-xs font-semibold leading-snug text-amber-900">
                MetaMask required for Local Geth
              </li>
            ) : (
              <>
                <li className="flex shrink-0 items-center">
                  <span
                    className={`inline-flex max-w-full items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase leading-tight tracking-wide sm:px-3 sm:py-1.5 sm:text-[11px] ${
                      onLocalGeth
                        ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                        : "border-amber-200 bg-amber-50 text-amber-900"
                    }`}
                  >
                    {onLocalGeth ? "Geth · 1337" : "Use chain 1337"}
                  </span>
                </li>
                <li className="flex shrink-0 items-center">
                  <button
                    type="button"
                    onClick={handleConnect}
                    className="rounded-lg bg-lightBlue-500 px-3 py-2 text-[10px] font-bold uppercase leading-none tracking-wide text-white shadow-sm outline-none ring-offset-2 transition hover:bg-lightBlue-600 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-lightBlue-400 active:scale-[0.98] sm:px-4 sm:text-xs"
                  >
                    <span className="sm:hidden">
                      {walletAddress ? "Reconnect" : "Connect"}
                    </span>
                    <span className="hidden sm:inline">
                      {walletAddress ? "Reconnect wallet" : "Connect wallet"}
                    </span>
                  </button>
                </li>
                {walletAddress ? (
                  <li className="hidden min-w-0 max-w-[8.5rem] shrink items-center sm:flex sm:max-w-[12rem]">
                    <span
                      className="block w-full truncate rounded-md border border-blueGray-200 bg-blueGray-50 px-2 py-1.5 text-center font-mono text-[10px] font-medium text-blueGray-900 sm:text-xs"
                      title={walletAddress}
                    >
                      {shortenAddress(walletAddress)}
                    </span>
                  </li>
                ) : (
                  <li className="hidden text-[10px] font-medium text-blueGray-500 sm:block sm:text-xs">
                    No wallet
                  </li>
                )}
                {walletError ? (
                  <li className="max-w-[10rem] shrink-0 text-[10px] font-medium leading-tight text-red-600 sm:max-w-[14rem] sm:text-xs">
                    {walletError}
                  </li>
                ) : null}
              </>
            )}
            <li className="flex shrink-0 items-center pl-0.5">
              <UserDropdown />
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
