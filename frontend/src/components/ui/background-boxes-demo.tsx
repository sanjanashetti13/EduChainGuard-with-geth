import React from "react";

import { Boxes } from "components/ui/background-boxes";
import { cn } from "lib/utils";

export type BackgroundBoxesDemoProps = {
  /** Main heading (shown above optional children). */
  title: string;
  subtitle?: React.ReactNode;
  className?: string;
  minHeightClassName?: string;
  children?: React.ReactNode;
};

/**
 * EduChainGuard branded shell: skewed neon grid + radial mask + content slot (card, stats, etc.).
 */
export function BackgroundBoxesDemo({
  title,
  subtitle,
  className,
  minHeightClassName = "min-h-[20rem]",
  children,
}: BackgroundBoxesDemoProps) {
  return (
    <div
      className={cn(
        "relative flex w-full flex-col items-center justify-center overflow-hidden rounded-2xl bg-slate-900",
        minHeightClassName,
        className
      )}
    >
      <Boxes />
      <div className="pointer-events-none absolute inset-0 z-20 h-full w-full bg-slate-900 [mask-image:radial-gradient(transparent,white)]" />

      <div className="relative z-30 flex w-full max-w-3xl flex-col items-center px-4 py-10 text-center">
        <h1 className={cn("text-xl font-semibold tracking-tight text-white md:text-4xl md:leading-tight")}>
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-2 max-w-2xl text-sm text-neutral-300 md:text-base">{subtitle}</p>
        ) : null}
        {children ? <div className="relative z-30 mt-8 w-full max-w-xl">{children}</div> : null}
      </div>
    </div>
  );
}
