import React, { useCallback, useState } from "react";

import { BackgroundBoxesDemo } from "components/ui/background-boxes-demo";

import {
  formatBlockchainError,
  hashFileSha256Hex,
  hasMetaMaskProvider,
  verifyCertificate as verifyCertOnChain,
} from "utils/blockchain";

const API_BASE = "http://localhost:5000";

function AlertBanner({ type, children, onClose }) {
  if (!children) return null;
  const styles = {
    error: "border-red-200 bg-red-50 text-red-800",
    info: "border-sky-200 bg-sky-50 text-sky-900",
  };
  const cls = styles[type] || styles.info;
  return (
    <div
      className={`mb-4 flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm shadow-sm ${cls}`}
      role="alert"
    >
      <span>{children}</span>
      <button
        type="button"
        onClick={onClose}
        className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold uppercase tracking-wide opacity-70 hover:opacity-100 focus:outline-none"
      >
        Dismiss
      </button>
    </div>
  );
}

async function recordVerificationMongo(email, hashHex, verified) {
  const res = await fetch(`${API_BASE}/verifier/record-verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, hash: hashHex, verified }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Could not save verification to database.");
  }
  return data;
}

export default function VerifyCertificate() {
  const [file, setFile] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const consumeFile = (f) => {
    if (!f) return;
    setFile(f);
    if (f.type.startsWith("image/")) {
      setPreviewURL(URL.createObjectURL(f));
    } else {
      setPreviewURL(null);
    }
    setResult(null);
    setBanner(null);
  };

  const handleFileChange = (e) => {
    consumeFile(e.target.files?.[0]);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f) consumeFile(f);
  };

  const clearBanner = useCallback(() => setBanner(null), []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBanner(null);
    setResult(null);

    if (!file) {
      setBanner({ type: "error", msg: "Please select a certificate file." });
      return;
    }

    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user?.email) {
      setBanner({ type: "error", msg: "You need to log in first." });
      return;
    }

    if (!hasMetaMaskProvider()) {
      setBanner({
        type: "error",
        msg: formatBlockchainError(new Error("METAMASK_MISSING")),
      });
      return;
    }

    setBusy(true);
    try {
      const hashHex = await hashFileSha256Hex(file);
      const verified = await verifyCertOnChain(hashHex);
      setResult({ verified, hash: hashHex });

      try {
        await recordVerificationMongo(user.email, hashHex, verified);
      } catch (dbErr) {
        setBanner({
          type: "info",
          msg: `Could not sync to dashboard: ${dbErr.message}`,
        });
      }

      if (previewURL) URL.revokeObjectURL(previewURL);
      setPreviewURL(null);
      setFile(null);
    } catch (err) {
      console.error(err);
      setBanner({ type: "error", msg: formatBlockchainError(err) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <BackgroundBoxesDemo
      title="Verifier workspace — check authenticity"
      subtitle="Compare a PDF or image fingerprint against CertificateStorage on Local Geth (chain 1337)."
      className="rounded-none shadow-none lg:rounded-b-3xl"
      minHeightClassName="min-h-screen"
    >
        <div className="rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-100">
          <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-[0.3em] text-indigo-500">
            CertificateStorage · Local Geth
          </p>
          <h2 className="mb-2 text-center text-3xl font-bold text-slate-800">
            Verify certificate
          </h2>
          <p className="mx-auto mb-8 max-w-md text-center text-sm font-medium text-neutral-800">
            Hashes must match uploads already stored via MetaMask on chain ID{" "}
            <span className="font-mono">1337</span>.
          </p>

          {banner?.msg && (
            <AlertBanner type={banner.type} onClose={clearBanner}>
              {banner.msg}
            </AlertBanner>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-3 block text-sm font-bold text-neutral-900">
                Certificate file (PDF or image)
              </label>
              <div
                role="presentation"
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={`flex min-h-[10rem] flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-6 text-center transition ${
                  dragActive
                    ? "border-indigo-500 bg-indigo-50/80"
                    : "border-slate-300 bg-slate-50 hover:border-indigo-300"
                }`}
              >
                <span className="text-3xl text-slate-400">
                  <i className="fas fa-file-signature" aria-hidden />
                </span>
                <label className="mt-4 inline-flex cursor-pointer items-center justify-center rounded-lg border-2 border-neutral-900 bg-white px-6 py-2.5 text-sm font-bold uppercase tracking-wide !text-neutral-900 shadow-sm transition hover:bg-neutral-100 active:scale-[0.98]">
                  Choose file
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
                {file && (
                  <p className="mt-3 truncate text-xs text-slate-500">
                    <span className="font-semibold">{file.name}</span>
                  </p>
                )}
              </div>
            </div>

            {previewURL && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-inner">
                <p className="mb-2 text-xs font-semibold uppercase text-slate-500">
                  Preview
                </p>
                <img
                  src={previewURL}
                  alt="Certificate preview"
                  className="max-h-72 w-full rounded-lg object-contain"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={busy || !file}
              className="w-full rounded-2xl border-2 border-neutral-900 bg-amber-400 py-4 text-sm font-bold uppercase tracking-wide !text-neutral-950 shadow-lg transition hover:bg-amber-300 hover:shadow-xl disabled:cursor-not-allowed disabled:border-neutral-300 disabled:!bg-neutral-100 disabled:!text-neutral-500 disabled:shadow-none active:scale-[0.99]"
            >
              {busy ? (
                <span className="!text-neutral-950">Checking…</span>
              ) : (
                "Verify on chain"
              )}
            </button>
          </form>

          {result && (
            <div className="mt-8 overflow-hidden rounded-2xl shadow-md ring-1 ring-slate-200">
              <div className={`px-6 py-5 ${result.verified ? "bg-emerald-50" : "bg-red-50"}`}>
                <div className="flex items-start gap-3">
                  <span className={`text-2xl ${result.verified ? "text-emerald-600" : "text-red-500"}`}>
                    <i
                      className={`fas fa-${result.verified ? "check-circle" : "times-circle"}`}
                      aria-hidden
                    />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-600">
                      On-chain status
                    </p>
                    <p
                      className={`mt-1 text-xl font-semibold ${
                        result.verified ? "text-emerald-800" : "text-red-800"
                      }`}
                    >
                      {result.verified
                        ? "Certificate hash is registered."
                        : "Certificate hash was not found."}
                    </p>
                  </div>
                </div>
              </div>
              <div className="border-t border-slate-100 bg-white px-6 py-4">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  SHA-256 (hex)
                </p>
                <p className="mt-2 break-all rounded-lg bg-slate-900 px-3 py-2 font-mono text-xs leading-relaxed text-emerald-200">
                  {result.hash}
                </p>
              </div>
            </div>
          )}
        </div>
    </BackgroundBoxesDemo>
  );
}
