import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  CloudUpload,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Upload,
  User,
} from "lucide-react";

import type { UserRole } from "lib/api/types";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: UserRole[];
  /** Shown disabled with tooltip for upcoming roles */
  disabled?: boolean;
};

const ALL_APP_ROLES: UserRole[] = ["admin", "institute", "verifier"];

export const APP_NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    roles: ["admin"],
  },
  {
    label: "Analytics",
    href: "/admin/tables",
    icon: BarChart3,
    roles: ["admin"],
  },
  {
    label: "Upload",
    href: "/admin/upload",
    icon: Upload,
    roles: ["institute"],
  },
  {
    label: "Verify",
    href: "/admin/verify",
    icon: ShieldCheck,
    roles: ["verifier"],
  },
  {
    label: "IPFS Upload",
    href: "/upload-ipfs",
    icon: CloudUpload,
    roles: ["admin", "institute", "verifier"],
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
    roles: ["admin"],
  },
  {
    label: "Profile",
    href: "/admin/profile",
    icon: User,
    roles: ALL_APP_ROLES,
  },
];

export function getNavItemsForRole(role: string | undefined): NavItem[] {
  if (!role) return [];
  return APP_NAV_ITEMS.filter((item) => item.roles.includes(role as UserRole));
}

export function getPageTitle(pathname: string): string {
  if (pathname.startsWith("/admin/dashboard")) return "Dashboard";
  if (pathname.startsWith("/admin/upload")) return "Upload certificate";
  if (pathname.startsWith("/admin/verify")) return "Verify certificate";
  if (pathname.startsWith("/admin/tables")) return "Analytics";
  if (pathname.startsWith("/admin/settings")) return "Settings";
  if (pathname.startsWith("/admin/profile")) return "Profile";
  if (pathname === "/upload-ipfs") return "IPFS upload";
  if (pathname === "/profile") return "Profile";
  return "EduChainGuard";
}
