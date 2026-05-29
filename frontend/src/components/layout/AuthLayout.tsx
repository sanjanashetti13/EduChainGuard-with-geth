import React from "react";
import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";

import ThemeToggle from "components/layout/ThemeToggle";

type AuthLayoutProps = {
  children: React.ReactNode;
};

/**
 * Minimal auth chrome (no sidebar) for login / register.
 */
export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-2 text-sm font-semibold text-foreground"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GraduationCap className="h-4 w-4" />
          </span>
          EduChainGuard
        </Link>
        <ThemeToggle />
      </header>
      <main className="flex flex-1 items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full min-w-[min(100%,320px)] max-w-md">{children}</div>
      </main>
      <footer className="shrink-0 border-t border-border py-4 text-center text-xs text-muted-foreground">
        Securing academic credentials with blockchain integrity
      </footer>
    </div>
  );
}
