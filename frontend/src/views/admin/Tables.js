/*eslint-disable*/
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Tables() {
  const [data, setData] = useState({
    admin: [],
    institute: [],
    verifier: [],
  });
  const [activeTab, setActiveTab] = useState("admin");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    fetchUserActivity();
  }, []);

  const fetchUserActivity = async () => {
    try {
      const res1 = await axios.get("http://localhost:5000/admin/user-activity");
      const res2 = await axios.get("http://localhost:5000/admin/verifier-activity");

      setData({
        admin: res1.data.admin,
        institute: res1.data.institute,
        verifier: res2.data.verifier,
      });
    } catch (err) {
      console.error("Failed to fetch user activity:", err);
    }
  };

  const renderUploads = (uploads) => (
    <ul className="list-disc pl-5 text-sm">
      {uploads?.map((upload, index) => (
        <li key={index} className="mb-2">
          <strong>{upload.filename}</strong> <br />
          Hash: <code className="text-xs break-all">{upload.hash}</code><br />
          Tx: <code className="text-xs break-all">{upload.tx_hash}</code><br />
          {upload.timestamp && (
            <>Time: {new Date(upload.timestamp).toLocaleString()}</>
          )}
        </li>
      ))}
    </ul>
  );

  const renderVerifications = (verifications) => (
    <ul className="list-disc pl-5 text-sm">
      {verifications?.map((v, index) => (
        <li key={index} className="mb-2">
          Hash: <code className="text-xs break-all">{v.hash}</code><br />
          {v.timestamp && (
            <>Time: {new Date(v.timestamp).toLocaleString()}</>
          )}
        </li>
      ))}
    </ul>
  );

  const renderTable = (users, role) => (
    <div className="mb-12">
      <div className="w-full overflow-x-auto rounded-lg shadow bg-white dark:bg-blueGray-800">
        <table className="min-w-[800px] table-auto text-left">
          <thead className="bg-blueGray-100 dark:bg-blueGray-700 uppercase text-xs font-semibold text-blueGray-600 dark:text-blueGray-200">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Email</th>
              {role !== "admin" && (
                <th className="px-6 py-3">
                  {role === "institute" ? "Uploads" : "Verifications"}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={role === "admin" ? 2 : 3} className="text-center text-blueGray-400 py-6">
                  No {role}s found.
                </td>
              </tr>
            ) : (
              users.map((user, index) => (
                <tr key={index} className="border-t hover:bg-blueGray-50 dark:hover:bg-blueGray-700 transition">
                  <td className="px-6 py-4 font-medium">{user.name}</td>
                  <td className="px-6 py-4">{user.email}</td>
                  {role !== "admin" && (
                    <td className="px-6 py-4 align-top">
                      {role === "institute"
                        ? renderUploads(user.uploads)
                        : renderVerifications(user.verifications)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const tabClass = (tab) =>
    `px-4 py-2 rounded-t-md text-sm font-semibold transition ${
      activeTab === tab
        ? "bg-white dark:bg-blueGray-800 text-blue-600 dark:text-blue-300 border-t-2 border-blue-500"
        : "bg-blueGray-100 dark:bg-blueGray-700 text-blueGray-600 dark:text-blueGray-300"
    }`;

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <div className="px-4 md:px-10 mx-auto w-full py-10 bg-blueGray-50 dark:bg-blueGray-900 min-h-screen transition-all">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-blueGray-800 dark:text-white">User Activity</h2>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition"
          >
            Toggle {darkMode ? "Light" : "Dark"} Mode
          </button>
        </div>

        <div className="flex space-x-2 mb-6">
          <button onClick={() => setActiveTab("admin")} className={tabClass("admin")}>Admins</button>
          <button onClick={() => setActiveTab("institute")} className={tabClass("institute")}>Institutes</button>
          <button onClick={() => setActiveTab("verifier")} className={tabClass("verifier")}>Verifiers</button>
        </div>

        {renderTable(data[activeTab], activeTab)}
      </div>
    </div>
  );
}
