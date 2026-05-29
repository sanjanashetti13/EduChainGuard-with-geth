/*eslint-disable*/
import React from "react";
import { Link } from "react-router-dom";
import NotificationDropdown from "../Dropdowns/NotificationDropdown";
import UserDropdown from "../Dropdowns/UserDropdown";

export default function Sidebar() {
  const [collapseShow, setCollapseShow] = React.useState("hidden");
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;

  // Role-Based Link Generator
  const renderSidebarLinks = () => {
    if (role === "admin") {
      return (
        <>
          <SidebarLink label="Dashboard" to="/admin/dashboard" icon="fas fa-tv" />
          <SidebarLink label="Tables" to="/admin/tables" icon="fas fa-table" />
          <SidebarLink label="IPFS Upload" to="/upload-ipfs" icon="fas fa-cloud-upload-alt" />
          <SidebarLink label="Profile" to="/admin/profile" icon="fas fa-user" />
        </>
      );
    }

    if (role === "institute") {
      return (
        <>
          <SidebarLink label="Upload Certificate" to="/admin/upload" icon="fas fa-upload" />
          <SidebarLink label="IPFS Upload" to="/upload-ipfs" icon="fas fa-cloud-upload-alt" />
          <SidebarLink label="Profile" to="/admin/profile" icon="fas fa-user" />
        </>
      );
    }

    if (role === "verifier") {
      return (
        <>
          <SidebarLink label="Verify Certificates" to="/admin/verify" icon="fas fa-check-circle" />
          <SidebarLink label="IPFS Upload" to="/upload-ipfs" icon="fas fa-cloud-upload-alt" />
          <SidebarLink label="Profile" to="/admin/profile" icon="fas fa-user" />
        </>
      );
    }

    return null; // Hide sidebar for unknown roles
  };

  return (
    <>
      <nav className="md:left-0 md:block md:fixed md:top-0 md:bottom-0 md:overflow-y-auto md:flex-row md:flex-nowrap md:overflow-hidden shadow-xl bg-white flex flex-wrap items-center justify-between relative md:w-64 z-10 py-4 px-6">
        <div className="md:flex-col md:items-stretch md:min-h-full md:flex-nowrap px-0 flex flex-wrap items-center justify-between w-full mx-auto">

          {/* Toggler */}
          <button
            className="cursor-pointer text-black opacity-50 md:hidden px-3 py-1 text-xl leading-none bg-transparent rounded border border-solid border-transparent"
            type="button"
            onClick={() => setCollapseShow("bg-white m-2 py-3 px-6")}
          >
            <i className="fas fa-bars"></i>
          </button>

          <Link
            className="md:block text-left md:pb-2 text-blueGray-600 mr-0 inline-block whitespace-nowrap text-sm uppercase font-bold p-4 px-0"
            to="/"
          >
            EduChainGuard
          </Link>

          {/* User dropdowns on small screen */}
          <ul className="md:hidden items-center flex flex-wrap list-none">
            <li className="inline-block relative">
              <NotificationDropdown />
            </li>
            <li className="inline-block relative">
              <UserDropdown />
            </li>
          </ul>

          {/* Collapse Section */}
          <div
            className={
              "md:flex md:flex-col md:items-stretch md:opacity-100 md:relative md:mt-4 md:shadow-none shadow absolute top-0 left-0 right-0 z-40 overflow-y-auto overflow-x-hidden h-auto items-center flex-1 rounded " +
              collapseShow
            }
          >

            {/* Collapse Header */}
            <div className="md:min-w-full md:hidden block pb-4 mb-4 border-b border-solid border-blueGray-200">
              <div className="flex flex-wrap">
                <div className="w-6/12">
                  <span
                    className="md:block text-left md:pb-2 text-blueGray-600 mr-0 inline-block whitespace-nowrap text-sm uppercase font-bold p-4 px-0"
                  >
                    EduChainGuard
                  </span>
                </div>
                <div className="w-6/12 flex justify-end">
                  <button
                    type="button"
                    className="cursor-pointer text-black opacity-50 md:hidden px-3 py-1 text-xl leading-none bg-transparent rounded border border-solid border-transparent"
                    onClick={() => setCollapseShow("hidden")}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* Search Input */}
            <form className="mt-6 mb-4 md:hidden">
              <div className="mb-3 pt-0">
                <input
                  type="text"
                  placeholder="Search"
                  className="border-0 px-3 py-2 h-12 border border-solid border-blueGray-500 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-base leading-snug shadow-none outline-none focus:outline-none w-full font-normal"
                />
              </div>
            </form>

            {/* Divider */}
            <hr className="my-4 md:min-w-full" />

            {/* Sidebar links based on role */}
            <h6 className="md:min-w-full text-blueGray-500 text-xs uppercase font-bold block pt-1 pb-4 no-underline">
              Navigation
            </h6>
            <ul className="md:flex-col md:min-w-full flex flex-col list-none">
              {renderSidebarLinks()}
            </ul>

            {/* Auth Layout Pages */}
            {/* Show Auth Links only if user is NOT logged in */}
          {!user && (
            <>
              <hr className="my-4 md:min-w-full" />
              <h6 className="md:min-w-full text-blueGray-500 text-xs uppercase font-bold block pt-1 pb-4 no-underline">
                Auth Pages
              </h6>
              <ul className="md:flex-col md:min-w-full flex flex-col list-none md:mb-4">
                <li className="items-center">
                  <Link
                    className="text-blueGray-700 hover:text-blueGray-500 text-xs uppercase py-3 font-bold block"
                    to="/auth/login"
                  >
                    <i className="fas fa-fingerprint text-blueGray-400 mr-2 text-sm"></i>{" "}
                    Login
                  </Link>
                </li>
                <li className="items-center">
                  <Link
                    className="text-blueGray-700 hover:text-blueGray-500 text-xs uppercase py-3 font-bold block"
                    to="/auth/register"
                  >
                    <i className="fas fa-clipboard-list text-blueGray-300 mr-2 text-sm"></i>{" "}
                    Register
                  </Link>
                </li>
              </ul>
            </>
          )}


          </div>
        </div>
      </nav>
    </>
  );
}

// Sidebar Link Component
function SidebarLink({ label, to, icon }) {
  const active = window.location.href.indexOf(to) !== -1;
  return (
    <li className="items-center">
      <Link
        className={`text-xs uppercase py-3 font-bold block ${
          active ? "text-lightBlue-500 hover:text-lightBlue-600" : "text-blueGray-700 hover:text-blueGray-500"
        }`}
        to={to}
      >
        <i
          className={`${icon} mr-2 text-sm ${
            active ? "opacity-75" : "text-blueGray-300"
          }`}
        ></i>{" "}
        {label}
      </Link>
    </li>
  );
}