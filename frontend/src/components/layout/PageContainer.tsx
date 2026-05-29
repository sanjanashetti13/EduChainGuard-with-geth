import React from "react";

import { cn } from "lib/utils";

type PageContainerProps = {
  children: React.ReactNode;
  className?: string;
  /** Allow full-bleed legacy pages (e.g. verify hero) */
  flush?: boolean;
};

export default function PageContainer({
  children,
  className,
  flush = false,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "w-full min-w-0",
        flush ? "px-0 py-0" : "px-4 py-6 sm:px-6 lg:px-8 lg:py-8",
        className
      )}
    >
      {children}
    </div>
  );
}
