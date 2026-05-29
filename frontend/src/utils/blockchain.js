import {
  ensureLocalGethNetwork,
  hasEthereum,
  isLocalGethChain,
  loadBlockchain,
  LOCAL_CHAIN_ID_DECIMAL,
  readChainIdHex,
} from "./web3";

export {
  loadBlockchain,
  ensureLocalGethNetwork,
  LOCAL_CHAIN_ID_DECIMAL,
  readChainIdHex,
  isLocalGethChain,
};

/** Same purpose as LOCAL_CHAIN_ID_DECIMAL — kept for any legacy imports. */
export const CHAIN_ID_GETH_LOCAL = LOCAL_CHAIN_ID_DECIMAL;

export function hasMetaMaskProvider() {
  return hasEthereum();
}

/**
 * @returns {{ address: string, web3: import("web3").default, contract: object }}
 */
export async function connectWallet() {
  const bundle = await loadBlockchain({ requestAccounts: true });
  if (!bundle) {
    throw new Error("METAMASK_MISSING");
  }
  const { account, web3, contract } = bundle;
  if (!account) {
    throw new Error("No account unlocked. Connect in MetaMask.");
  }
  return { address: account, web3, contract };
}

export async function ensureChain() {
  await ensureLocalGethNetwork();
}

export function hexSha256ToBytes32(hashHex) {
  const h = hashHex.replace(/^0x/i, "");
  if (!/^[0-9a-fA-F]{64}$/.test(h)) {
    throw new Error(
      "Certificate hash must be a 64-character hex string (SHA-256)."
    );
  }
  return "0x" + h;
}

export async function hashFileSha256Hex(file) {
  const buf = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Upload hash on-chain via MetaMask + CertificateStorage.
 */
export async function uploadCertificate(hashHex) {
  await ensureLocalGethNetwork();
  const { contract, account } = await loadBlockchain({ requestAccounts: true });
  if (!account) throw new Error("No account unlocked. Connect in MetaMask.");
  const certHash = hexSha256ToBytes32(hashHex);

  try {
    const receipt = await contract.methods
      .uploadCertificate(certHash)
      .send({ from: account });
    const txHash = receipt.transactionHash ?? receipt.txHash ?? receipt.hash;
    return { txHash };
  } catch (e) {
    if (e?.code === 4001) {
      throw new Error("Transaction was rejected in MetaMask.");
    }
    throw e;
  }
}

/**
 * View call — CertificateStorage.verifyCertificate(bytes32) → bool
 */
export async function verifyCertificate(hashHex) {
  await ensureLocalGethNetwork();
  const { contract, account } = await loadBlockchain({ requestAccounts: true });
  const certHash = hexSha256ToBytes32(hashHex);
  try {
    const opts = account ? { from: account } : {};
    const raw = await contract.methods.verifyCertificate(certHash).call(opts);
    if (typeof raw === "boolean") return raw;
    return Boolean(raw);
  } catch (e) {
    if (
      typeof e?.message === "string" &&
      /execution reverted|CALL_EXCEPTION/i.test(e.message)
    ) {
      return false;
    }
    throw e;
  }
}

/**
 * Friendly messages for in-app banners (avoid raw browser alerts).
 */
export function formatBlockchainError(err) {
  const code =
    typeof err?.message === "string" ? err.message : String(err ?? "Unknown");

  if (code.includes("METAMASK_MISSING")) {
    return "MetaMask is not installed. Add the MetaMask extension and refresh.";
  }
  if (code.includes("METAMASK_REJECTED")) {
    return "Network change was declined in MetaMask.";
  }
  if (code.includes("MISSING_CONTRACT_ENV")) {
    return "Missing REACT_APP_CONTRACT_ADDRESS_LOCAL in frontend .env.";
  }
  if (code.includes("WRONG_NETWORK")) {
    return "Please switch to Local Geth (Chain ID 1337 — http://127.0.0.1:8545).";
  }
  if (code.includes("User rejected")) {
    return "Request was cancelled in MetaMask.";
  }
  if (err?.code === 4001) {
    return "Request was cancelled in MetaMask.";
  }

  const msg =
    typeof err?.message === "string" ? err.message : "Something went wrong.";
  return msg.replace(/^.*?:/, "").trim() || msg;
}
