import React, { useState } from "react";

export default function CardSettings() {
  const [uploadLimit, setUploadLimit] = useState(5);
  const [contractAddress, setContractAddress] = useState("");
  const [enableLogging, setEnableLogging] = useState(true);
  const [clearing, setClearing] = useState(false);

  const handleSave = () => {
    alert("Settings saved (this is a placeholder)");
    // In production: POST to `/admin/settings` endpoint
  };

  const handleClearLogs = async () => {
    if (!window.confirm("Are you sure you want to clear all certificate logs?")) return;

    setClearing(true);
    try {
      const res = await fetch("http://localhost:5000/admin/clear-logs", {
        method: "DELETE",
      });
      const data = await res.json();
      alert(data.message || "Logs cleared.");
    } catch (err) {
      alert("Error clearing logs.");
    }
    setClearing(false);
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-lg mt-6 mb-10">
      <h2 className="text-2xl font-bold text-blueGray-800 mb-6">Admin Settings</h2>

      {/* Upload Limit */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-blueGray-600 mb-2">
          Max Certificates Upload Limit per Institute
        </label>
        <input
          type="number"
          value={uploadLimit}
          onChange={(e) => setUploadLimit(parseInt(e.target.value))}
          className="w-full border border-blueGray-300 rounded px-4 py-2 focus:outline-none focus:ring focus:border-lightBlue-500"
        />
      </div>

      {/* Contract Address */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-blueGray-600 mb-2">
          Blockchain Contract Address (Advanced)
        </label>
        <input
          type="text"
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value)}
          placeholder="0x..."
          className="w-full border border-blueGray-300 rounded px-4 py-2 focus:outline-none focus:ring focus:border-lightBlue-500"
        />
      </div>

      {/* Enable/Disable Logging */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-blueGray-600 mb-2">
          Enable Verifier Logging
        </label>
        <select
          value={enableLogging ? "enabled" : "disabled"}
          onChange={(e) => setEnableLogging(e.target.value === "enabled")}
          className="w-full border border-blueGray-300 rounded px-4 py-2 focus:outline-none focus:ring focus:border-lightBlue-500"
        >
          <option value="enabled">Enabled</option>
          <option value="disabled">Disabled</option>
        </select>
      </div>

      {/* Save Button */}
      <div className="flex justify-end mb-6">
        <button
          onClick={handleSave}
          className="bg-lightBlue-500 hover:bg-lightBlue-600 text-white font-bold py-2 px-6 rounded"
        >
          Save Settings
        </button>
      </div>

      {/* Danger Zone */}
      <hr className="border-blueGray-200 mb-4" />
      <div className="mt-4">
        <h3 className="text-red-600 font-semibold mb-2 text-lg">Danger Zone</h3>
        <button
          onClick={handleClearLogs}
          disabled={clearing}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded"
        >
          {clearing ? "Clearing..." : "Clear All Certificate Logs"}
        </button>
      </div>
    </div>
  );
}
