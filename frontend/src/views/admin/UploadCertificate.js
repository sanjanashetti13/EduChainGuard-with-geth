/* eslint-disable */
import React, { useCallback, useState } from "react";
import { CloudUpload } from "lucide-react";

import InstituteWalletCard from "components/institute/WalletCard";
import InstituteUploadCard from "components/institute/UploadCard";

import {
  formatBlockchainError,
  hashFileSha256Hex,
  hasMetaMaskProvider,
  uploadCertificate,
} from "utils/blockchain";

const API_BASE = "http://localhost:5000";

export default function UploadCertificate() {
  const [file, setFile] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [banner, setBanner] = useState(null);

  const consumeFile = (f) => {
    if (!f) return;
    setFile(f);
    if (f.type.startsWith("image/")) {
      setPreviewURL(URL.createObjectURL(f));
    } else {
      setPreviewURL(null);
    }
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

  const recordUploadMongo = async (email, txHash, hashHex, filename) => {
    const res = await fetch(`${API_BASE}/institute/record-upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        tx_hash: txHash,
        hash: hashHex,
        filename: filename || "certificate",
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || "Could not save upload record to database.");
    }
    return data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBanner(null);

    if (!file) {
      setBanner({ type: "error", msg: "Please choose a PDF or image to upload." });
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

    setUploading(true);
    try {
      const hashHex = await hashFileSha256Hex(file);
      const { txHash } = await uploadCertificate(hashHex);
      try {
        await recordUploadMongo(user.email, txHash, hashHex, file.name);
      } catch (dbErr) {
        setBanner({
          type: "success",
          msg: `Blockchain upload succeeded.\nTx: ${txHash}\nWarning: Could not sync to dashboard database — ${dbErr.message}`,
        });
        setFile(null);
        if (previewURL) URL.revokeObjectURL(previewURL);
        setPreviewURL(null);
        return;
      }

      setBanner({
        type: "success",
        msg: `Stored on-chain and recorded locally.\nTransaction hash:\n${txHash}`,
      });
      setFile(null);
      if (previewURL) URL.revokeObjectURL(previewURL);
      setPreviewURL(null);
    } catch (err) {
      console.error(err);
      setBanner({
        type: "error",
        msg: formatBlockchainError(err),
      });
    } finally {
      setUploading(false);
    }
  };

  const clearBanner = useCallback(() => setBanner(null), []);

  const scrollToUpload = () => {
    document
      .getElementById("institute-upload-zone")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="w-full min-w-0 max-w-full pb-16 pt-6 md:pt-8">
      <div className="mx-auto w-full min-w-0 max-w-6xl px-4 py-6 sm:px-6 md:px-8 md:py-8">
        <header className="mb-10 flex flex-col gap-5 border-b border-slate-200 pb-8 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-950 md:text-3xl">
              Institute Workspace
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-neutral-900 md:text-base">
              Upload and anchor certificates securely on blockchain
            </p>
          </div>
          <button
            type="button"
            onClick={scrollToUpload}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border-2 border-indigo-600 bg-white px-5 py-2.5 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-50 hover:text-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 active:scale-[0.98] sm:self-center"
          >
            <CloudUpload className="h-4 w-4 text-indigo-600" strokeWidth={2} aria-hidden />
            Jump to upload
          </button>
        </header>

        <div className="flex flex-col gap-10">
          <InstituteWalletCard />
          <InstituteUploadCard
            banner={banner}
            file={file}
            previewURL={previewURL}
            uploading={uploading}
            dragActive={dragActive}
            onClearBanner={clearBanner}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onFileChange={handleFileChange}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
