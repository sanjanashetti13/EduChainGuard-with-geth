export const shortenAddress = (addr) => {
  if (!addr || typeof addr !== "string") {
    return "No Wallet";
  }
  return addr.slice(0, 6) + "..." + addr.slice(-4);
};
