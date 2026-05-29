import Web3 from "web3";
import CertificateStorage from "../abis/CertificateStorage.json";

export const LOCAL_CHAIN_ID_DECIMAL = 1337;
export const LOCAL_CHAIN_ID_HEX = "0x539";

const GETH_LOCAL_CHAIN_PARAMS = {
  chainId: LOCAL_CHAIN_ID_HEX,
  chainName: "Geth Local",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: ["http://127.0.0.1:8545"],
  blockExplorerUrls: [],
};

export function hasEthereum() {
  return typeof window !== "undefined" && Boolean(window.ethereum);
}

export async function readChainIdHex() {
  if (!hasEthereum()) return null;
  try {
    return await window.ethereum.request({ method: "eth_chainId" });
  } catch {
    return null;
  }
}

export function isLocalGethChain(chainIdHex) {
  if (!chainIdHex || typeof chainIdHex !== "string") return false;
  return Number.parseInt(chainIdHex, 16) === LOCAL_CHAIN_ID_DECIMAL;
}

/**
 * Prompt MetaMask to use Local Geth (chainId 1337, RPC http://127.0.0.1:8545).
 */
export async function ensureLocalGethNetwork() {
  if (!hasEthereum()) {
    throw new Error("METAMASK_MISSING");
  }

  let chainId = await readChainIdHex();
  if (isLocalGethChain(chainId)) return;

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: LOCAL_CHAIN_ID_HEX }],
    });
  } catch (switchErr) {
    if (switchErr?.code === 4902 || switchErr?.code === -32603) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [GETH_LOCAL_CHAIN_PARAMS],
      });
    } else if (switchErr?.code === 4001) {
      throw new Error("METAMASK_REJECTED");
    } else {
      throw switchErr;
    }
  }

  chainId = await readChainIdHex();
  if (!isLocalGethChain(chainId)) {
    throw new Error("WRONG_NETWORK");
  }
}

/**
 * MetaMask + local Geth + CertificateStorage contract.
 * @param {{ requestAccounts?: boolean }} opts
 */
export async function loadBlockchain(opts = {}) {
  const requestAccounts = opts.requestAccounts !== false;

  if (!hasEthereum()) {
    return null;
  }

  await ensureLocalGethNetwork();

  const web3 = new Web3(window.ethereum);

  if (requestAccounts) {
    await window.ethereum.request({ method: "eth_requestAccounts" });
  }

  const accounts = await web3.eth.getAccounts();
  const account = accounts[0] ?? null;

  const deployed = process.env.REACT_APP_CONTRACT_ADDRESS_LOCAL?.trim();
  if (!deployed) {
    throw new Error("MISSING_CONTRACT_ENV");
  }

  const contract = new web3.eth.Contract(CertificateStorage.abi, deployed);

  return { web3, account, contract };
}
