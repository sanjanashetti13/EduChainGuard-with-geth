import React from "react";
import { NavLink } from "react-router-dom";
import { Upload, User, CloudUpload } from "lucide-react";

import { cn } from "lib/utils";

const linkBase =
  "flex min-w-fit items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors";

export default function Sidebar() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      linkBase,
      isActive
        ? "bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200/80 dark:bg-slate-800 dark:text-white dark:ring-slate-600"
        : "text-slate-600 hover:bg-white/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-white"
    );

  return (
    <aside
      className="w-full shrink-0 rounded-xl border border-slate-200/80 bg-gray-100 p-3 dark:border-slate-700 dark:bg-slate-900/50 lg:w-[240px] lg:self-start lg:p-4"
      aria-label="Institute workspace navigation"
    >
      <p className="mb-2 hidden px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 lg:block">
        Workspace
      </p>
      <nav className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] lg:flex-col lg:overflow-visible lg:pb-0 [&::-webkit-scrollbar]:hidden">
        <NavLink end to="/admin/upload" className={linkClass}>
          <Upload className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
          Upload Certificate
        </NavLink>
        <NavLink to="/upload-ipfs" className={linkClass}>
          <CloudUpload className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
          IPFS Upload
        </NavLink>
        <NavLink to="/admin/profile" className={linkClass}>
          <User className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
          Profile
        </NavLink>
      </nav>
    </aside>
  );
}
