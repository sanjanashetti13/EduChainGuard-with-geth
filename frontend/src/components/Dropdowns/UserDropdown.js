import React from "react";
import { createPopper } from "@popperjs/core";
import { Link, useNavigate } from "react-router-dom";

const UserDropdown = () => {
  const navigate = useNavigate();
  const [dropdownPopoverShow, setDropdownPopoverShow] = React.useState(false);
  const btnDropdownRef = React.createRef();
  const popoverDropdownRef = React.createRef();

  const openDropdownPopover = () => {
    createPopper(btnDropdownRef.current, popoverDropdownRef.current, {
      placement: "bottom-start",
    });
    setDropdownPopoverShow(true);
  };

  const closeDropdownPopover = () => {
    setDropdownPopoverShow(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    closeDropdownPopover();
    navigate("/auth/login");
  };

  return (
    <>
      <button
        type="button"
        className="text-blueGray-500 block focus:outline-none"
        ref={btnDropdownRef}
        aria-expanded={dropdownPopoverShow}
        aria-haspopup="true"
        onClick={() => {
          dropdownPopoverShow ? closeDropdownPopover() : openDropdownPopover();
        }}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blueGray-200 text-xl text-blueGray-600 shadow-lg">
          <i className="fas fa-user" aria-hidden />
        </span>
      </button>
      <div
        ref={popoverDropdownRef}
        className={
          (dropdownPopoverShow ? "block " : "hidden ") +
          "bg-white text-base z-50 float-left py-2 list-none text-left rounded shadow-lg min-w-48"
        }
      >
        <Link
          to="/admin/profile"
          className="text-sm py-2 px-4 font-normal block w-full whitespace-nowrap bg-transparent text-blueGray-700 hover:bg-blueGray-50"
          onClick={closeDropdownPopover}
        >
          Profile
        </Link>
        <div className="my-2 border border-solid border-blueGray-100" />
        <button
          type="button"
          className="text-sm py-2 px-4 font-normal block w-full whitespace-nowrap bg-transparent text-left text-blueGray-700 hover:bg-blueGray-50"
          onClick={handleLogout}
        >
          Log out
        </button>
      </div>
    </>
  );
};

export default UserDropdown;
