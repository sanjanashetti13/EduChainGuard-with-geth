/*eslint-disable */
import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Profile() {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/auth/login");
  };

  return (
    <div className="min-h-screen bg-blueGray-50 px-4 py-10 md:px-10">
      <h2 className="text-3xl font-bold text-blueGray-800 mb-8">Your profile</h2>
      <div className="relative flex max-w-xl flex-col break-words rounded-lg bg-white px-6 py-8 shadow-lg">
        <h3 className="text-2xl font-semibold text-blueGray-700">
          {user?.name || "Unknown User"}
        </h3>
        <p className="mt-2 text-sm font-bold uppercase text-blueGray-400">
          <i className="fas fa-envelope mr-2 text-lg text-blueGray-400" />
          {user?.email || "No Email"}
        </p>
        <p className="mt-4 text-blueGray-600">
          <i className="fas fa-user-tag mr-2 text-lg text-blueGray-400" />
          Role: <span className="capitalize">{user?.role || "N/A"}</span>
        </p>
        <p className="mt-6 text-blueGray-700">
          Manage your account and use the sidebar to open certificate tools for your role.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/"
            className="inline-flex rounded bg-lightBlue-500 px-5 py-2 text-xs font-bold uppercase text-white shadow transition hover:bg-lightBlue-600"
          >
            Home
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex rounded bg-red-500 px-5 py-2 text-xs font-bold uppercase text-white shadow transition hover:bg-red-600"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
