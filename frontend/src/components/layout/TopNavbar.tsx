import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";

import { Button } from "components/ui/button";
import { Separator } from "components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "components/ui/sheet";
import ChainModeSwitcher from "components/layout/ChainModeSwitcher";
import ChainStatusBadge from "components/layout/ChainStatusBadge";
import NavbarWalletButton from "components/layout/NavbarWalletButton";
import ThemeToggle from "components/layout/ThemeToggle";
import UserMenu from "components/layout/UserMenu";
import { AppSidebarContent } from "components/layout/AppSidebar";
import { getPageTitle } from "lib/navigation";

export default function TopNavbar() {
  const { pathname } = useLocation();
  const title = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="md:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <AppSidebarContent />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <h1 className="truncate text-sm font-semibold text-foreground sm:text-base">
          {title}
        </h1>
        <Link
          to="/"
          className="hidden text-xs text-muted-foreground hover:text-foreground sm:inline"
        >
          EduChainGuard
        </Link>
      </div>

      <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
        <div className="hidden items-center gap-2 lg:flex">
          <ChainStatusBadge />
          <ChainModeSwitcher compact />
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ChainStatusBadge showChainId={false} />
        </div>

        <Separator orientation="vertical" className="hidden h-6 sm:block" />

        <NavbarWalletButton />
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
