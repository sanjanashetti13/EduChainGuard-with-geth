import React, { useEffect, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function UploadsChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const res = await fetch("http://localhost:5000/admin/uploads-per-day");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Failed to fetch chart data", err);
      }
    };

    fetchChartData();
  }, []);

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h4 className="text-lg font-semibold mb-4 text-blueGray-700">
        Daily Certificate Uploads (Past 7 Days)
      </h4>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
