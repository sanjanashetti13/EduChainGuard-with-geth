import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios, { AxiosProgressEvent } from "axios";
import {
  AudioLines,
  Check,
  ClipboardCopy,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Loader2,
  Film,
  FileType2,
  CloudUpload,
} from "lucide-react";

function apiBase(): string {
  return process.env.REACT_APP_API_URL ?? "http://localhost:5000";
}

/** Pull a readable message from axios error bodies (Pinata / Flask). */
function axiosErrorMessage(err: unknown): string {
  const ax = err as {
    response?: { data?: unknown };
    message?: string;
  };
  const data = ax?.response?.data;
  if (data && typeof data === "object" && data !== null) {
    const o = data as Record<string, unknown>;
    if (typeof o.error === "string") return o.error;
    if (o.error && typeof o.error === "object") {
      const e = o.error as Record<string, unknown>;
      const s = e.details ?? e.reason ?? e.message;
      if (typeof s === "string") return s;
    }
    if (typeof o.message === "string") return o.message;
    try {
      return JSON.stringify(data);
    } catch {
      /* fall through */
    }
  }
  return ax?.message || "Network error while uploading. Is the Flask backend running?";
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let i = -1;
  let v = n;
  do {
    v /= 1024;
    i++;
  } while (v >= 1024 && i < units.length - 1);
  return `${v.toFixed(v < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

function fileKind(file: File | null): "image" | "video" | "audio" | "pdf" | "text" | "other" {
  if (!file) return "other";
  const t = file.type || "";
  if (t.startsWith("image/")) return "image";
  if (t.startsWith("video/")) return "video";
  if (t.startsWith("audio/")) return "audio";
  if (t === "application/pdf" || file.name?.toLowerCase().endsWith(".pdf")) return "pdf";
  if (t.startsWith("text/")) return "text";
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "txt" || ext === "md" || ext === "csv" || ext === "json") return "text";
  return "other";
}

type UploadResult = {
  cid: string;
  url: string;
  uploadedAt: string;
  sizeLabel: string;
  name: string;
};

export default function IpfsUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [textPreview, setTextPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; kind: "ok" | "err" } | null>(null);

  const kind = useMemo(() => fileKind(file), [file]);

  useEffect(() => {
    setTextPreview(null);
    if (!file) {
      setPreviewURL(null);
      return undefined;
    }

    const k = fileKind(file);
    let objectUrl: string | null = null;
    if (k === "image" || k === "video" || k === "audio" || k === "pdf") {
      objectUrl = URL.createObjectURL(file);
      setPreviewURL(objectUrl);
    } else {
      setPreviewURL(null);
    }

    if (k === "text" && file.size <= 512 * 1024) {
      const reader = new FileReader();
      reader.onload = () => {
        const text = typeof reader.result === "string" ? reader.result : "";
        setTextPreview(text.slice(0, 12000));
      };
      reader.readAsText(file, "UTF-8");
    }

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 3800);
    return () => clearTimeout(id);
  }, [toast]);

  const consumeFile = useCallback((f: File | undefined | null) => {
    if (!f) return;
    setFile(f);
    setError(null);
    setResult(null);
    setProgress(0);
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    consumeFile(e.target.files?.[0]);
    e.target.value = "";
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f) consumeFile(f);
  };

  const showToast = (msg: string, kind: "ok" | "err") => setToast({ msg, kind });

  const submit = async () => {
    setError(null);
    setResult(null);
    if (!file) {
      setError("Select a file to upload.");
      return;
    }

    const form = new FormData();
    form.append("file", file);

    setUploading(true);
    setProgress(0);

    try {
      const res = await axios.post(`${apiBase()}/upload-to-pinata`, form, {
        onUploadProgress: (evt: AxiosProgressEvent) => {
          if (evt.total) {
            setProgress(Math.round((evt.loaded * 100) / evt.total));
          } else {
            setProgress(0);
          }
        },
      });

      const data = res.data;
      if (!data?.success || !data.cid || !data.url) {
        const msg =
          typeof data?.error === "string"
            ? data.error
            : "Upload failed. Check Pinata credentials on the server.";
        setError(msg);
        showToast(msg, "err");
        return;
      }

      const uploadedAt = new Date().toISOString();
      setResult({
        cid: data.cid,
        url: data.url,
        uploadedAt,
        sizeLabel: formatBytes(file.size),
        name: file.name,
      });
      showToast("File pinned to IPFS successfully.", "ok");
    } catch (err: unknown) {
      const msg = axiosErrorMessage(err);
      setError(msg);
      showToast(msg, "err");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const copyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      showToast("Gateway link copied to clipboard.", "ok");
    } catch {
      showToast("Could not copy — copy manually from the field below.", "err");
    }
  };

  return (
    <div className="w-full min-w-0 max-w-full pb-20 pt-6 md:pt-8">
      {toast && (
        <div
          className={`fixed bottom-6 right-4 z-50 max-w-sm rounded-lg border px-4 py-3 text-sm font-medium shadow-lg transition dark:border-slate-600 ${
            toast.kind === "ok"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/90 dark:text-emerald-100"
              : "border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/90 dark:text-red-100"
          }`}
          role="status"
        >
          {toast.msg}
        </div>
      )}

      <div className="mx-auto w-full min-w-0 max-w-5xl px-4 py-6 sm:px-6 md:px-8 md:py-8">
        <header className="mb-10 border-b border-slate-200 pb-8 dark:border-slate-700">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Decentralized storage
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white md:text-3xl">
                IPFS upload (Pinata)
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                Upload media, documents, or any file type to IPFS. This flow is independent of
                certificate anchoring and does not use your MetaMask wallet.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white/80 p-3 dark:border-slate-600 dark:bg-slate-900/60">
              <span className="flex items-center gap-1.5 rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                <ImageIcon className="h-3.5 w-3.5" aria-hidden /> Image
              </span>
              <span className="flex items-center gap-1.5 rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                <Film className="h-3.5 w-3.5" aria-hidden /> Video
              </span>
              <span className="flex items-center gap-1.5 rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                <AudioLines className="h-3.5 w-3.5" aria-hidden /> Audio
              </span>
              <span className="flex items-center gap-1.5 rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                <FileType2 className="h-3.5 w-3.5" aria-hidden /> PDF
              </span>
              <span className="flex items-center gap-1.5 rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                <FileText className="h-3.5 w-3.5" aria-hidden /> Text
              </span>
            </div>
          </div>
        </header>

        <div className="grid items-start gap-8 lg:grid-cols-[1fr_320px] lg:gap-10">
          <div className="min-w-0 space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4 dark:border-slate-700 dark:bg-slate-800/50">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
                  <CloudUpload className="h-5 w-5 text-indigo-600" aria-hidden />
                  Upload
                </h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Drag and drop files here or click to browse. Large files may take longer to pin.
                </p>
              </div>

              <div className="p-5 md:p-6">
                <label
                  htmlFor="ipfs-file"
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  className={`flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-10 text-center transition ${
                    dragActive
                      ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40"
                      : "border-slate-300 bg-slate-50/30 hover:border-indigo-300 hover:bg-indigo-50/30 dark:border-slate-600 dark:bg-slate-800/40 dark:hover:border-indigo-500 dark:hover:bg-indigo-950/20"
                  }`}
                >
                  <CloudUpload className="mb-3 h-10 w-10 text-indigo-500" strokeWidth={1.75} aria-hidden />
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    Drop file or browse
                  </span>
                  <span className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Any common type — processed via Pinata
                  </span>
                  <input
                    id="ipfs-file"
                    type="file"
                    className="sr-only"
                    onChange={onFileChange}
                  />
                </label>

                {error && (
                  <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-100">
                    {error}
                  </p>
                )}

                {file && (
                  <div className="mt-6 space-y-4">
                    <div className="rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm dark:border-slate-600 dark:bg-slate-800/50">
                      <p className="font-semibold text-slate-900 dark:text-white">Selected file</p>
                      <p className="mt-1 break-all font-mono text-xs text-slate-700 dark:text-slate-300">
                        {file.name}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span>Type: {file.type || "unknown"}</span>
                        <span>Size: {formatBytes(file.size)}</span>
                      </div>
                    </div>

                    {/* Primary action above preview so large PDFs/images never hide the button */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                      <button
                        type="button"
                        disabled={uploading}
                        onClick={submit}
                        aria-label="Upload file to IPFS"
                        className="inline-flex w-full min-h-[48px] shrink-0 items-center justify-center gap-2 rounded-lg border border-black bg-black px-5 py-3.5 text-sm font-semibold tracking-wide text-white shadow-md transition hover:bg-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-55 dark:border-black dark:bg-black dark:text-white dark:hover:bg-neutral-900 sm:w-auto"
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-white" aria-hidden />
                            Uploading…
                          </>
                        ) : (
                          <>
                            <CloudUpload className="h-4 w-4 shrink-0 text-white" aria-hidden />
                            upload
                          </>
                        )}
                      </button>
                      <p className="text-xs text-slate-500 dark:text-slate-400 sm:max-w-xs sm:self-center">
                        Sends this file to your backend, then Pinata. Check the red error box if Pinata
                        returns 401/403 (JWT or API keys in server <code className="rounded bg-slate-200 px-1 dark:bg-slate-700">.env</code>
                        ).
                      </p>
                    </div>

                    {uploading && (
                      <div>
                        <div className="mb-1 flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
                          <span className="inline-flex items-center gap-2">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                            Uploading to Pinata…
                          </span>
                          <span>{progress > 0 ? `${progress}%` : "…"}</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                          <div
                            className="h-full rounded-full bg-indigo-600 transition-all duration-200 dark:bg-indigo-500"
                            style={{ width: progress > 0 ? `${progress}%` : "38%" }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-950">
                      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                        Preview
                      </p>
                      <div className="flex max-h-[min(360px,55vh)] min-h-[140px] items-center justify-center overflow-auto rounded-lg bg-slate-100 dark:bg-slate-900 sm:max-h-[360px]">
                        {kind === "image" && previewURL && (
                          <img
                            src={previewURL}
                            alt="Selected preview"
                            className="max-h-[min(340px,50vh)] max-w-full object-contain sm:max-h-[340px]"
                          />
                        )}
                        {kind === "video" && previewURL && (
                          <video
                            controls
                            className="max-h-[min(340px,50vh)] w-full max-w-full sm:max-h-[340px]"
                            src={previewURL}
                          />
                        )}
                        {kind === "audio" && previewURL && (
                          <audio controls className="w-full px-4" src={previewURL} />
                        )}
                        {kind === "pdf" && previewURL && (
                          <iframe
                            title="PDF preview"
                            src={previewURL}
                            className="h-[min(320px,50vh)] w-full rounded border border-slate-200 dark:border-slate-700 sm:h-[320px]"
                          />
                        )}
                        {kind === "text" && (
                          <pre className="max-h-[min(340px,50vh)] w-full overflow-auto p-3 text-left text-xs text-slate-800 dark:text-slate-200 sm:max-h-[340px]">
                            {textPreview !== null ? textPreview || "(empty)" : "Loading preview…"}
                          </pre>
                        )}
                        {kind === "other" && (
                          <span className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
                            Preview not available for this file type — you can still upload to IPFS.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {result && (
              <section className="overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50/60 shadow-sm dark:border-emerald-900 dark:bg-emerald-950/30">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-emerald-200/80 px-5 py-4 dark:border-emerald-900/80">
                  <div>
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-emerald-900 dark:text-emerald-100">
                      <Check className="h-5 w-5" aria-hidden />
                      Upload complete
                    </h2>
                    <p className="mt-1 text-sm text-emerald-900/85 dark:text-emerald-100/90">
                      {result.name}{" "}
                      <span className="opacity-75"> · {result.sizeLabel}</span>
                    </p>
                  </div>
                  <span className="rounded-md bg-white/70 px-2 py-1 text-xs font-medium text-emerald-900 dark:bg-emerald-900/70 dark:text-emerald-100">
                    Pinned{" "}
                    {new Intl.DateTimeFormat(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(result.uploadedAt))}
                  </span>
                </div>
                <div className="space-y-4 px-5 py-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-emerald-800 dark:text-emerald-200">
                      Content identifier (CID)
                    </p>
                    <code className="mt-2 block break-all rounded-lg bg-white px-3 py-2 text-xs text-slate-800 shadow-inner dark:bg-slate-950 dark:text-slate-100">
                      {result.cid}
                    </code>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-emerald-800 dark:text-emerald-200">
                      Gateway URL
                    </p>
                    <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex flex-1 items-center gap-2 break-all rounded-lg bg-white px-3 py-2 text-xs font-medium text-indigo-700 underline-offset-4 hover:underline dark:bg-slate-950 dark:text-indigo-300"
                      >
                        {result.url}
                        <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      </a>
                      <button
                        type="button"
                        onClick={() => copyLink(result.url)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-300 bg-white px-3 py-2 text-xs font-semibold text-emerald-900 hover:bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-100 dark:hover:bg-emerald-900"
                      >
                        <ClipboardCopy className="h-3.5 w-3.5" aria-hidden />
                        Copy link
                      </button>
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
                      >
                        Open file
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                      </a>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <h3 className="font-semibold text-slate-900 dark:text-white">About this upload</h3>
              <ul className="mt-3 space-y-2 text-slate-600 dark:text-slate-400">
                <li>Uses server route POST /upload-to-pinata → Pinata.</li>
                <li>Does not call the certificate contract.</li>
                <li>Set PINATA_JWT (recommended) or API key pair in backend .env.</li>
              </ul>
            </div>
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-4 text-sm dark:border-indigo-900 dark:bg-indigo-950/50">
              <h3 className="font-semibold text-indigo-950 dark:text-indigo-100">Tip</h3>
              <p className="mt-2 text-indigo-900/90 dark:text-indigo-200/90">
                Gateway propagation can take a few seconds after pinning. If a link fails at first,
                retry shortly — the CID is immutable on IPFS once pinned.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
