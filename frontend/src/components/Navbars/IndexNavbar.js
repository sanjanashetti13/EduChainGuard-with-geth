/*eslint-disable*/
import React from "react";
import { Link, useNavigate } from "react-router-dom";

import { dashboardPathForRole } from "utils/routeForRole";

function roleLinkLabel(role) {
  if (role === "admin") return "Dashboard";
  if (role === "institute") return "Upload";
  if (role === "verifier") return "Verify";
  return "App";
}

/**
 * @param {{ fixed?: boolean, variant?: string, surface?: 'light' | 'dark' }} props
 */
export default function IndexNavbar(props) {
  const { fixed, variant: _variant, surface = "light" } = props;
  const [navbarOpen, setNavbarOpen] = React.useState(false);
  let user = null;
  try {
    const raw = localStorage.getItem("user");
    if (raw) user = JSON.parse(raw);
  } catch {
    try {
      localStorage.removeItem("user");
    } catch {
      /* ignore */
    }
    user = null;
  }
  const navigate = useNavigate();
  const dark = surface === "dark";

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/auth/login");
  };

  const rolePath = user?.role ? dashboardPathForRole(user.role) : "/";

  const linkItem = dark
    ? "text-zinc-200 hover:text-white px-3 py-2 text-xs uppercase font-bold transition"
    : "text-blueGray-700 hover:text-blueGray-500 px-3 py-2 text-xs uppercase font-bold";

  return (
    <>
      <nav
        className={
          (fixed ? "top-0 fixed " : "") +
          (dark
            ? "z-50 w-full flex flex-wrap items-center justify-between px-2 py-3 border-b border-white/10 bg-zinc-950/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.35)]"
            : "z-50 w-full flex flex-wrap items-center justify-between px-2 py-3 navbar-expand-lg bg-white shadow")
        }
      >
        <div className="container px-4 mx-auto flex flex-wrap items-center justify-between">
          <div className="w-full relative flex justify-between lg:w-auto lg:static lg:block lg:justify-start">
            <Link
              to="/"
              className={
                (dark
                  ? "text-white hover:text-[#00ff88] "
                  : "text-blueGray-700 ") +
                "text-sm font-bold leading-relaxed inline-block mr-4 py-2 whitespace-nowrap uppercase tracking-wide transition"
              }
            >
              EduChainGuard
            </Link>
            <button
              className={
                (dark
                  ? "text-zinc-200 hover:text-white "
                  : "text-blueGray-700 ") +
                "cursor-pointer text-xl leading-none px-3 py-1 border border-solid border-transparent rounded bg-transparent block lg:hidden outline-none focus:outline-none"
              }
              type="button"
              onClick={() => setNavbarOpen(!navbarOpen)}
            >
              <i className="fas fa-bars"></i>
            </button>
          </div>

          <div
            className={
              (dark
                ? "lg:flex flex-grow items-center rounded-xl border border-white/10 bg-zinc-900/95 lg:border-0 lg:bg-transparent "
                : "lg:flex flex-grow items-center bg-white lg:bg-opacity-0 lg:shadow-none ") +
              (navbarOpen ? " block p-3 mt-2 lg:p-0 lg:mt-0" : " hidden") +
              " lg:block"
            }
            id="example-navbar-warning"
          >
            <ul className="flex flex-col lg:flex-row list-none lg:ml-auto lg:gap-1">
              {!user ? (
                <>
                  <li className="flex items-center">
                    <Link to="/auth/login" className={linkItem}>
                      <i className="fas fa-sign-in-alt mr-1"></i> Login
                    </Link>
                  </li>
                  <li className="flex items-center">
                    <Link to="/auth/register" className={linkItem}>
                      <i className="fas fa-user-plus mr-1"></i> Register
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-center">
                    <Link to={rolePath} className={linkItem}>
                      <i className="fas fa-th-large mr-1"></i> {roleLinkLabel(user.role)}
                    </Link>
                  </li>
                  <li className="flex items-center">
                    <Link to="/profile" className={linkItem}>
                      <i className="fas fa-user-circle mr-1"></i> Profile
                    </Link>
                  </li>
                  <li className="flex items-center">
                    <button
                      onClick={handleLogout}
                      className={linkItem + " focus:outline-none"}
                    >
                      <i className="fas fa-sign-out-alt mr-1"></i> Logout
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}
