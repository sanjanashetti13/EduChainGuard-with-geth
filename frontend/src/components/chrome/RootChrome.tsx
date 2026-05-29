import React from "react";

import "components/ui/ethereal.css";

type RootChromeProps = {
  children: React.ReactNode;
};

/** Lightweight ethereal branding present on every route (full WebGL hero is route-specific). */
export default function RootChrome({ children }: RootChromeProps) {
  return (
    <>
      <div className="ethereal-accent-strip" aria-hidden />
      {children}
    </>
  );
}
