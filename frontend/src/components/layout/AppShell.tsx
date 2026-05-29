import React from "react";

import AppSidebarDesktop from "components/layout/AppSidebar";
import PageContainer from "components/layout/PageContainer";
import TopNavbar from "components/layout/TopNavbar";
import ChainModeSwitcher from "components/layout/ChainModeSwitcher";
import ChainStatusBadge from "components/layout/ChainStatusBadge";
import { cn } from "lib/utils";

type AppShellProps = {
  children: React.ReactNode;
  /** Full-bleed page content without default padding */
  flush?: boolean;
  className?: string;
};

export default function AppShell({
  children,
  flush = false,
  className,
}: AppShellProps) {
  return (
    <div className={cn("min-h-screen bg-background", className)}>
      <AppSidebarDesktop />
      <div className="flex min-h-screen flex-col md:pl-64">
        <TopNavbar />
        {/* Mobile chain controls below navbar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/30 px-4 py-2 md:hidden">
          <ChainStatusBadge />
          <ChainModeSwitcher compact />
        </div>
        <main className="flex-1">
          <PageContainer flush={flush}>{children}</PageContainer>
        </main>
      </div>
    </div>
  );
}
