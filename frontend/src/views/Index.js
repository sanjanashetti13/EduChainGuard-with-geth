/*eslint-disable*/
import React from "react";

import IndexNavbar from "components/Navbars/IndexNavbar.js";
import Footer from "components/Footers/Footer.js";
import AppPurposeNav from "components/AppPurposeNav.jsx";
import WalletStatusBlock from "components/home/WalletStatusBlock.jsx";
import { FallingPattern } from "components/ui/falling-pattern";

/** Home `/` — matches FallingPattern demo props (neon + radial mask via `--background`). */
export default function Index() {
  return (
    <div className="dark min-h-screen bg-[#050505] text-zinc-100 [--background:#050505]">
      <IndexNavbar fixed surface="dark" />

      <div className="relative min-h-screen w-full overflow-x-hidden">
        <FallingPattern
          color="#00ff88"
          backgroundColor="#050505"
          duration={80}
          blurIntensity="0.5rem"
          density={2}
          className="pointer-events-none fixed inset-0 z-0 h-screen min-h-screen w-full [mask-image:radial-gradient(ellipse_at_center,transparent,var(--background))]"
          aria-hidden
        />

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-[1200px] flex-col gap-8 px-4 sm:px-6 lg:gap-10 lg:px-8 lg:min-h-[calc(100vh-3.75rem)]">
          <div className="flex flex-1 flex-col items-center justify-center py-14 text-center sm:py-20 lg:py-24">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.45em] text-[#00ff88] sm:text-xs">
              EDUCHAINGUARD · LOCAL GETH
            </p>

            <h1 className="mt-8 max-w-4xl font-mono text-5xl font-extrabold leading-none tracking-tighter text-white sm:text-6xl lg:text-7xl">
              EduChainGuard
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-pretty font-sans text-base leading-relaxed text-zinc-400 sm:text-lg">
              Institutes register documents on your private Geth node (chain ID 1337). Verifiers
              check the same hash against the on-chain registry.
            </p>

            <div className="mt-12 flex justify-center transition duration-300 hover:[&_a]:scale-[1.02]">
              <AppPurposeNav tone="dark" />
            </div>
          </div>

          <div className="mt-auto shrink-0 pb-10 lg:relative lg:pb-14">
            <div className="mx-auto max-w-md rounded-xl border border-white/10 bg-zinc-950/55 p-1 shadow-xl shadow-black/40 backdrop-blur-md lg:absolute lg:bottom-0 lg:left-0 lg:mx-0 lg:max-w-sm">
              <WalletStatusBlock className="!mt-0 max-w-none" />
            </div>
          </div>
        </div>
      </div>

      <section className="relative z-10 border-t border-white/10 bg-zinc-950 pb-24 pt-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-[1200px] text-center">
            <h2 className="mb-5 text-3xl font-semibold tracking-tight text-white">
              Why EduChainGuard?
            </h2>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-zinc-400">
              Transparent integrity checks with no external testnet switches — your workstation
              runs RPC at{" "}
              <span className="rounded-lg border border-white/15 bg-black/40 px-2 py-0.5 font-mono text-sm text-[#00ff88]">
                127.0.0.1:8545
              </span>
              .
            </p>
          </div>
        </div>
      </section>

      <Footer tone="dark" />
    </div>
  );
}
