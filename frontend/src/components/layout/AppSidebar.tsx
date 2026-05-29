import React from "react";
import { Link, useLocation } from "react-router-dom";
import { GraduationCap } from "lucide-react";

import { Badge } from "components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "components/ui/tooltip";
import { useAuth } from "hooks/useAuth";
import { getNavItemsForRole } from "lib/navigation";
import { cn } from "lib/utils";

type SidebarNavProps = {
  onNavigate?: () => void;
};

function SidebarNav({ onNavigate }: SidebarNavProps) {
  const { user } = useAuth();
  const location = useLocation();
  const items = getNavItemsForRole(user?.role);

  if (!user) {
    return (
      <p className="px-3 text-sm text-muted-foreground">
        Sign in to access the workspace.
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <p className="px-3 text-sm text-muted-foreground">
        No navigation items for your account. Contact an administrator if this
        looks wrong.
      </p>
    );
  }

  return (
    <nav className="flex flex-col gap-1" aria-label="Main">
      {items.map((item) => {
        const Icon = item.icon;
        const active =
          location.pathname === item.href ||
          (item.href !== "/" && location.pathname.startsWith(item.href));

        if (item.disabled) {
          return (
            <Tooltip key={item.label}>
              <TooltipTrigger asChild>
                <span
                  className={cn(
                    "flex cursor-not-allowed items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground opacity-60"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                  <Badge variant="secondary" className="ml-auto text-[10px]">
                    Soon
                  </Badge>
                </span>
              </TooltipTrigger>
              <TooltipContent side="right">Coming soon</TooltipContent>
            </Tooltip>
          );
        }

        return (
          <Link
            key={item.href}
            to={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

type AppSidebarProps = {
  className?: string;
};

/** Desktop sidebar (fixed). */
export function AppSidebarDesktop({ className }: AppSidebarProps) {
  return (
    <aside
      className={cn(
        "hidden h-screen w-64 flex-col border-r border-border bg-card md:fixed md:inset-y-0 md:z-40 md:flex",
        className
      )}
    >
      <AppSidebarContent />
    </aside>
  );
}

export function AppSidebarContent() {
  return (
    <>
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <Link
          to="/"
          className="flex items-center gap-2 font-semibold tracking-tight text-foreground"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GraduationCap className="h-4 w-4" />
          </span>
          <span className="text-sm">EduChainGuard</span>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Navigation
        </p>
        <SidebarNav />
      </div>
    </>
  );
}

export default AppSidebarDesktop;
