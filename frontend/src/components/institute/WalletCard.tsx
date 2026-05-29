import React from "react";

import WalletStatusBlock from "components/home/WalletStatusBlock.jsx";

export default function WalletCard() {
  return (
    <WalletStatusBlock
      variant="card"
      hideHeading
      className="w-full min-w-0 rounded-xl border border-slate-200 bg-white p-7 shadow-md md:p-8"
    />
  );
}
