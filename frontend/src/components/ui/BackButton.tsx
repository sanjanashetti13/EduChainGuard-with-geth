import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { cn } from "lib/utils";

export type BackButtonProps = {
  /** When set, always navigates here instead of history back */
  to?: string;
  className?: string;
  label?: string;
};

export default function BackButton({
  to,
  className,
  label = "Back",
}: BackButtonProps) {
  const navigate = useNavigate();

  const go = () => {
    if (to) navigate(to);
    else {
      navigate(-1);
    }
  };

  return (
    <button
      type="button"
      onClick={go}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/25 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white/85 backdrop-blur-sm transition hover:border-white/30 hover:bg-white/10 hover:text-white",
        className
      )}
    >
      <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
      {label}
    </button>
  );
}
