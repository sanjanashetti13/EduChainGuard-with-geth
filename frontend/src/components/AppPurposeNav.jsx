import React from "react";
import { Link, useLocation } from "react-router-dom";

import { cn } from "lib/utils";
import { dashboardPathForRole } from "utils/routeForRole";

function pillClass(active, tone) {
  if (tone === "light") {
    return cn(
      "rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide shadow-sm transition duration-200 hover:scale-[1.02]",
      active
        ? "border-indigo-600 bg-indigo-600 text-white shadow-indigo-200"
        : "border-slate-200 bg-white text-slate-800 hover:border-indigo-300 hover:bg-indigo-50/90 hover:text-indigo-900 active:scale-[0.98]"
    );
  }
  return cn(
    "rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide transition duration-200 hover:scale-[1.02] active:scale-[0.98]",
    active
      ? "border-white bg-white/15 text-white"
      : "border-white/30 text-slate-100 hover:border-white/60 hover:bg-white/10"
  );
}

function rolePrimaryLabel(role) {
  if (role === "admin") return "Dashboard";
  if (role === "institute") return "Upload";
  if (role === "verifier") return "Verify";
  return "App";
}

export default function AppPurposeNav({ tone = "dark" }) {
  const raw = localStorage.getItem("user");
  let user = null;
  try {
    user = raw ? JSON.parse(raw) : null;
  } catch {
    user = null;
  }

  const location = useLocation();
  const path = location.pathname;
  const rolePath = user?.role ? dashboardPathForRole(user.role) : "";

  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-2"
      aria-label="Primary intent"
    >
      <Link to="/" className={pillClass(path === "/", tone)}>
        Home
      </Link>

      {!user ? (
        <>
          <Link to="/auth/login" className={pillClass(path.startsWith("/auth/login"), tone)}>
            Login
          </Link>
          <Link
            to="/auth/register"
            className={pillClass(path.startsWith("/auth/register"), tone)}
          >
            Register
          </Link>
        </>
      ) : (
        <>
          <Link
            to={rolePath}
            className={pillClass(rolePath && path.startsWith(rolePath), tone)}
          >
            {rolePrimaryLabel(user.role)}
          </Link>
          <Link to="/profile" className={pillClass(path === "/profile", tone)}>
            Profile
          </Link>
        </>
      )}
    </nav>
  );
}
