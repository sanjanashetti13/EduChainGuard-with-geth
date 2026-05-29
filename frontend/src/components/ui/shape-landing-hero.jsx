import React from "react";

import { cn } from "lib/utils";

/**
 * Structural hero shell: geometric backdrop + content slot (badge, titles, children).
 */
export default function ShapeLandingHero({
  badge,
  title,
  subtitle,
  children,
  className,
  contentClassName,
}) {
  return (
    <section
      className={cn(
        "relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-24",
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-slate-950"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-indigo-600/30 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-sky-600/25 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
        aria-hidden
      />
      <div
        className={cn(
          "relative z-10 flex w-full max-w-3xl flex-col items-center text-center",
          contentClassName
        )}
      >
        {badge ? (
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.45em] text-slate-300">
            {badge}
          </p>
        ) : null}
        {title ? (
          <h1 className="mb-3 text-3xl font-semibold leading-tight text-white md:text-5xl">
            {title}
          </h1>
        ) : null}
        {subtitle ? (
          <p className="mx-auto mb-8 max-w-xl text-lg text-slate-300">{subtitle}</p>
        ) : null}
        {children}
      </div>
    </section>
  );
}
