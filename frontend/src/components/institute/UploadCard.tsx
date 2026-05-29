import React from "react";
import { CloudUpload } from "lucide-react";
import { motion } from "framer-motion";

type Banner = { type: string; msg: string } | null;

function AlertBanner({
  type,
  children,
  onClose,
}: {
  type: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  if (!children) return null;
  const styles: Record<string, string> = {
    error:
      "border-red-100 bg-red-50 text-red-900 ring-red-500/10 dark:border-red-900/40 dark:bg-red-950/50 dark:text-red-100",
    success:
      "border-emerald-100 bg-emerald-50 text-emerald-950 ring-emerald-500/10 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-100",
    info: "border-sky-100 bg-sky-50 text-sky-950 ring-sky-500/10 dark:border-sky-900/40 dark:bg-sky-950/40 dark:text-sky-100",
  };
  const cls = styles[type] || styles.info;
  return (
    <div
      className={`mb-6 flex items-start justify-between gap-4 rounded-xl border px-4 py-3 text-sm shadow-sm ring-1 ${cls}`}
      role="alert"
    >
      <span className="whitespace-pre-wrap leading-relaxed">{children}</span>
      <button
        type="button"
        onClick={onClose}
        className="shrink-0 rounded-lg px-2 py-1 text-xs font-bold uppercase tracking-wide text-slate-500 transition hover:bg-white/70 hover:text-slate-900 focus:outline-none dark:hover:bg-slate-800/80 dark:hover:text-slate-200"
      >
        Dismiss
      </button>
    </div>
  );
}

type UploadCardProps = {
  id?: string;
  file: File | null;
  previewURL: string | null;
  uploading: boolean;
  dragActive: boolean;
  banner: Banner;
  onClearBanner: () => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

export default function UploadCard({
  id = "institute-upload-zone",
  file,
  previewURL,
  uploading,
  dragActive,
  banner,
  onClearBanner,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileChange,
  onSubmit,
}: UploadCardProps) {
  return (
    <motion.section
      id={id}
      tabIndex={-1}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="w-full min-w-0 scroll-mt-28 rounded-xl border border-slate-200 bg-white p-7 shadow-lg md:p-9"
    >
      <header className="mb-8 space-y-3 border-b border-slate-200 pb-7">
        <h2 className="text-xl font-semibold tracking-tight text-neutral-900 md:text-2xl">
          Upload Certificate
        </h2>
        <p className="text-[15px] font-medium leading-relaxed text-neutral-900">
          Drag & drop PDF or image, or click to browse
        </p>
      </header>

      {banner?.msg ? (
        <AlertBanner type={banner.type} onClose={onClearBanner}>
          {banner.msg}
        </AlertBanner>
      ) : null}

      <form onSubmit={onSubmit} className="flex flex-col gap-10">
        <div className="space-y-4">
          <div
            role="presentation"
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={[
              "group flex min-h-[12.5rem] cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed px-7 py-8 text-center transition md:min-h-[14rem]",
              dragActive
                ? "scale-[1.01] border-indigo-600 bg-indigo-50 shadow-inner"
                : "border-neutral-400 bg-neutral-50 hover:border-indigo-500 hover:bg-indigo-50/90 hover:shadow-md",
            ].join(" ")}
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-indigo-700 shadow ring-2 ring-neutral-200 transition-transform group-hover:scale-105">
              <CloudUpload className="h-6 w-6" strokeWidth={1.75} aria-hidden />
            </span>
            <p className="mt-4 text-base font-semibold !text-neutral-900">
              Drop files here or click to upload
            </p>
            <p className="mt-1 text-sm font-medium !text-neutral-800">
              PDF, PNG, JPEG supported
            </p>
            <label className="mt-6 inline-flex cursor-pointer items-center justify-center rounded-lg border-2 border-neutral-900 bg-white px-6 py-2.5 text-sm font-bold !text-neutral-900 shadow-sm transition hover:bg-neutral-100 active:scale-[0.98]">
              Browse files
              <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={onFileChange}
              />
            </label>
          </div>
          {file ? (
            <p className="text-sm font-medium text-neutral-800">
              Selected:{" "}
              <span className="font-mono font-semibold text-neutral-950">
                {file.name}
              </span>
            </p>
          ) : null}
        </div>

        {previewURL ? (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-5 shadow-inner">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-wider text-neutral-900">
              Preview
            </p>
            <img
              src={previewURL}
              alt="Certificate preview"
              className="max-h-80 w-full rounded-lg object-contain transition hover:opacity-95"
            />
          </div>
        ) : null}

        <button
          type="submit"
          disabled={uploading || !file}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-neutral-900 bg-amber-400 py-4 text-sm font-bold uppercase tracking-wide !text-neutral-950 shadow-md transition hover:bg-amber-300 hover:shadow-lg disabled:cursor-not-allowed disabled:border-neutral-300 disabled:!bg-neutral-100 disabled:!text-neutral-500 disabled:shadow-none disabled:hover:bg-neutral-100 active:scale-[0.99]"
        >
          {uploading ? (
            <>
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent" />
              <span className="!text-neutral-950">Submitting…</span>
            </>
          ) : (
            "Upload to blockchain"
          )}
        </button>
      </form>
    </motion.section>
  );
}
