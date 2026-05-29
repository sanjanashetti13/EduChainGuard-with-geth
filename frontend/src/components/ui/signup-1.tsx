import { Link } from "react-router-dom";
import type { ReactNode } from "react";

import { cn } from "lib/utils";

import { Button } from "components/ui/button";

export interface Signup1Logo {
  url?: string;
  src?: string;
  alt: string;
  title?: string;
}

export interface Signup1Props {
  heading?: string;
  logo?: Signup1Logo;
  signupText?: string;
  googleText?: string;
  loginText?: string;
  loginUrl?: string;
  /** Replace default footer (e.g. mode toggle buttons) */
  footer?: ReactNode;
  /** Sign in / Sign up segmented control */
  tabs?: ReactNode;
  /** Status + error banners */
  alerts?: ReactNode;
  /** Decorative primary row when not wiring full form (demo) */
  showDemoPrimary?: boolean;
  onDemoPrimaryClick?: () => void;
  /** Google iframe / SDK slot */
  googleSlot?: ReactNode;
  /** Main form body */
  children?: ReactNode;
  homeHref?: string;
  brandLabel?: string;
  className?: string;
  subheading?: string;
}

const defaultLogo: Signup1Logo = {
  src: "",
  alt: "EduChainGuard",
  title: "EduChainGuard",
};

/**
 * shadcn-style centered auth shell (muted page + card).
 * Use with `Button` / `Input` and `.auth-app` theme tokens.
 */
const Signup1 = ({
  heading,
  logo = defaultLogo,
  signupText = "Create an account",
  googleText = "Sign up with Google",
  loginText = "Already have an account?",
  loginUrl = "/auth/login",
  footer,
  tabs,
  alerts,
  showDemoPrimary = false,
  onDemoPrimaryClick,
  googleSlot,
  children,
  homeHref = "/landing",
  brandLabel = "EduChainGuard",
  className,
  subheading,
}: Signup1Props) => {
  const mergedLogo = { ...defaultLogo, ...logo };

  return (
    <section
      className={cn(
        "auth-app relative min-h-screen overflow-hidden",
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-zinc-950"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-1/4 top-0 h-[42rem] w-[42rem] rounded-full bg-primary/25 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-1/4 bottom-0 h-[36rem] w-[36rem] rounded-full bg-fuchsia-600/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,rgba(9,9,11,0.15)_0%,rgba(9,9,11,0.85)_45%,rgba(12,10,32,0.95)_100%)]"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239363f1%22%20fill-opacity%3D%220.07%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-90" />

      <div className="relative z-[1] flex min-h-screen flex-col items-center justify-center px-4 py-10 sm:px-6">
        <div className="mb-8 flex w-full max-w-md shrink-0 items-center justify-between gap-4">
          <Link
            to={homeHref}
            className="text-sm font-medium text-primary underline-offset-4 transition hover:text-primary/80 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            ← Home
          </Link>
          <span className="truncate text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            {brandLabel}
          </span>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/90 flex w-full max-w-md flex-col items-center gap-y-8 px-6 py-10 shadow-2xl shadow-black/50 ring-1 ring-zinc-700/60 backdrop-blur-md sm:px-10 sm:py-12">
          <div className="flex flex-col items-center gap-y-3 text-center">
            <div className="flex items-center gap-1 lg:justify-start">
              {mergedLogo.src ? (
                <a href={mergedLogo.url ?? "#"} className="block">
                  <img
                    src={mergedLogo.src}
                    alt={mergedLogo.alt}
                    title={mergedLogo.title}
                    className="h-10 dark:invert"
                  />
                </a>
              ) : (
                <Link
                  to={mergedLogo.url ?? homeHref}
                  className="flex items-center gap-2 font-bold tracking-tight"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-600 text-lg text-white shadow-md">
                    E
                  </span>
                  <span className="bg-gradient-to-r from-indigo-200 to-fuchsia-200 bg-clip-text text-xl text-transparent sm:text-2xl">
                    {mergedLogo.title ?? "EduChainGuard"}
                  </span>
                </Link>
              )}
            </div>
            {tabs ? (
              <div className="w-full [&_*]:ring-offset-background">{tabs}</div>
            ) : null}
            {heading ? (
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                {heading}
              </h1>
            ) : null}
            {subheading ? (
              <p className="max-w-sm text-[15px] leading-relaxed text-muted-foreground">
                {subheading}
              </p>
            ) : null}
          </div>

          {alerts}

          <div className="flex w-full flex-col gap-6">
            <div className="flex w-full flex-col items-stretch justify-center gap-2">
              {googleSlot ? (
                <div className="flex w-full min-h-[44px] justify-center [&>div]:flex [&>div]:w-full [&>div]:justify-center [&>div>div]:w-full">
                  {googleSlot}
                </div>
              ) : null}
            </div>

            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-border" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                or email
              </span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <div className="flex w-full flex-col gap-4">
              {showDemoPrimary ? (
                <Button
                  type="button"
                  className="mt-1 w-full bg-primary text-primary-foreground shadow-md shadow-primary/25"
                  onClick={onDemoPrimaryClick}
                >
                  {signupText}
                </Button>
              ) : null}
              {children}
            </div>
          </div>

          {footer !== undefined ? (
            footer
          ) : (
            <div className="text-muted-foreground flex flex-wrap justify-center gap-1 text-sm">
              <p>{loginText}</p>
              <Link
                to={loginUrl}
                className="text-primary font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export { Signup1 };
