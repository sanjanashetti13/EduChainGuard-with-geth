import React, { useEffect, useState } from "react";
import { BackgroundBoxesDemo } from "components/ui/background-boxes-demo";
import UploadsChart from "components/Charts/UploadsChart.js";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUploads: 0,
    totalVerified: 0,
    users: {
      admin: 0,
      institute: 0,
      verifier: 0,
    },
    recent: [],
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("http://localhost:5000/admin/stats");
        const data = await res.json();
        if (res.ok) setStats(data);
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <>
      <div className="px-4 pt-8 md:px-10">
        <BackgroundBoxesDemo
          title="EduChainGuard admin dashboard"
          subtitle="Track certificate uploads, on-chain verification counts, institutes, verifiers, and recent activity—all aligned with Local Geth (chain ID 1337)."
          minHeightClassName="min-h-[280px] md:min-h-[320px]"
        />
      </div>

      <div className="min-h-screen bg-blueGray-50 px-4 md:px-10 py-10">
      {/* Chart Section */}
      <div className="bg-white p-6 rounded-lg shadow mb-10 overflow-x-auto">
        <h3 className="text-xl font-semibold text-blueGray-700 mb-4">Uploads Trend</h3>
        <div className="min-w-[320px]">
          <UploadsChart />
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <StatCard label="Total Certificates Uploaded" value={stats.totalUploads} />
        <StatCard label="Total Verified Certificates" value={stats.totalVerified} />
        <StatCard label="Registered Institutes" value={stats.users.institute} />
        <StatCard label="Registered Verifiers" value={stats.users.verifier} />
      </div>

      {/* Recent Uploads Table */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="text-xl font-semibold text-blueGray-700 mb-4">
          Recent Certificate Uploads
        </h4>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left table-auto border border-blueGray-100">
            <thead className="bg-blueGray-100 text-blueGray-600 uppercase text-xs">
              <tr>
                <th className="p-3 font-semibold">Email</th>
                <th className="p-3 font-semibold">Filename</th>
                <th className="p-3 font-semibold">Hash</th>
                <th className="p-3 font-semibold">Transaction</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent.length > 0 ? (
                stats.recent.map((item, i) => (
                  <tr key={i} className="border-b hover:bg-blueGray-50 transition">
                    <td className="p-3 text-blueGray-700">{item.email}</td>
                    <td className="p-3 text-blueGray-700">{item.filename}</td>
                    <td className="p-3 text-xs text-blueGray-600 truncate max-w-xs">
                      {item.hash}
                    </td>
                    <td className="p-3 text-lightBlue-500 text-xs truncate max-w-xs">
                      <a
                        href={`https://amoy.polygonscan.com/tx/${item.tx_hash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline"
                      >
                        {item.tx_hash}
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-4 text-blueGray-500" colSpan={4}>
                    No recent uploads found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-lg shadow p-6 text-center hover:shadow-md transition">
      <div className="text-sm text-blueGray-500 mb-2">{label}</div>
      <div className="text-2xl font-bold text-blueGray-800">{value}</div>
    </div>
  );
}
