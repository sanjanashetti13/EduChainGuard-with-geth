/**
 * Supported blockchain networks for certificate upload/verify.
 * Used by chain selector UI (Phase 1+). Does not alter web3.js / blockchain.js logic.
 */

export type ChainMode = "geth-local" | "polygon-amoy";

export type ChainDefinition = {
  id: ChainMode;
  label: string;
  shortLabel: string;
  chainIdDecimal: number;
  chainIdHex: string;
  rpcUrl: string;
  nativeCurrency: { name: string; symbol: string; decimals: number };
  blockExplorerUrl?: string;
  /** Server-side Flask/Web3.py signs transactions on this network */
  serverSigned: boolean;
  /** Browser MetaMask signs transactions */
  walletSigned: boolean;
};

export const CHAIN_GETH_LOCAL: ChainDefinition = {
  id: "geth-local",
  label: "Local Geth",
  shortLabel: "Geth",
  chainIdDecimal: 1337,
  chainIdHex: "0x539",
  rpcUrl: "http://127.0.0.1:8545",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  serverSigned: false,
  walletSigned: true,
};

export const CHAIN_POLYGON_AMOY: ChainDefinition = {
  id: "polygon-amoy",
  label: "Polygon Amoy",
  shortLabel: "Amoy",
  chainIdDecimal: 80002,
  chainIdHex: "0x13882",
  rpcUrl: "https://rpc-amoy.polygon.technology",
  nativeCurrency: { name: "POL", symbol: "POL", decimals: 18 },
  blockExplorerUrl: "https://amoy.polygonscan.com",
  serverSigned: true,
  walletSigned: false,
};

export const SUPPORTED_CHAINS: ChainDefinition[] = [
  CHAIN_GETH_LOCAL,
  CHAIN_POLYGON_AMOY,
];

export const DEFAULT_CHAIN_MODE: ChainMode = "geth-local";

const STORAGE_KEY = "educhain:chain-mode";

export function getStoredChainMode(): ChainMode {
  if (typeof window === "undefined") return DEFAULT_CHAIN_MODE;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === "polygon-amoy" || raw === "geth-local") return raw;
  return DEFAULT_CHAIN_MODE;
}

export function setStoredChainMode(mode: ChainMode): void {
  localStorage.setItem(STORAGE_KEY, mode);
}

export function getChainByMode(mode: ChainMode): ChainDefinition {
  return mode === "polygon-amoy" ? CHAIN_POLYGON_AMOY : CHAIN_GETH_LOCAL;
}
