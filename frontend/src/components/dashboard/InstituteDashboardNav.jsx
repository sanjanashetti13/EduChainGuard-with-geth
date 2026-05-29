import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Upload, User, LogOut } from "lucide-react";

export default function InstituteDashboardNav() {
  const navigate = useNavigate();

  const scrollToUpload = () => {
    document
      .getElementById("institute-upload-zone")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/auth/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/90 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="text-xs font-bold tracking-[0.28em] text-slate-900 transition hover:text-indigo-600 sm:text-[0.8125rem] sm:tracking-[0.32em]"
        >
          EDUCHAINGUARD
        </Link>

        <nav className="flex shrink-0 items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={scrollToUpload}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-md transition hover:bg-indigo-700 hover:shadow-lg active:scale-[0.98] sm:px-5 sm:py-2 sm:text-sm sm:normal-case sm:tracking-normal"
          >
            <Upload className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
            <span className="hidden sm:inline">Upload</span>
          </button>

          <Link
            to="/admin/profile"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-800 active:scale-[0.98] sm:px-5 sm:py-2 sm:text-sm"
          >
            <User className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
            <span className="hidden sm:inline">Profile</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98] sm:px-4 sm:text-sm"
          >
            <LogOut className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
