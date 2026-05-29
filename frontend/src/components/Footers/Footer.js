import React from "react";

/** @param {{ tone?: 'light' | 'dark' }} props */
export default function Footer({ tone = "light" }) {
  if (tone === "dark") {
    return (
      <footer className="relative z-10 border-t border-white/10 bg-black py-10">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm font-semibold text-zinc-500">
            © {new Date().getFullYear()} EduChainGuard
          </p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="relative bg-blueGray-200 pt-8 pb-6">
      <div
        className="bottom-auto top-0 left-0 right-0 w-full absolute pointer-events-none overflow-hidden -mt-20 h-20"
        style={{ transform: "translateZ(0)" }}
      >
        <svg
          className="absolute bottom-0 overflow-hidden"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          version="1.1"
          viewBox="0 0 2560 100"
          x="0"
          y="0"
        >
          <polygon
            className="text-blueGray-200 fill-current"
            points="2560 0 2560 100 0 100"
          />
        </svg>
      </div>
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center text-center">
          <div className="w-full px-4">
            <p className="text-blueGray-600 text-sm font-semibold py-1">
              © {new Date().getFullYear()} EduChainGuard
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
