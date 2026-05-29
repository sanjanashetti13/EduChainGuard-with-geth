import React from "react";
import { createPopper } from "@popperjs/core";

const TableDropdown = () => {
  const [dropdownPopoverShow, setDropdownPopoverShow] = React.useState(false);
  const btnDropdownRef = React.createRef();
  const popoverDropdownRef = React.createRef();

  const openDropdownPopover = () => {
    createPopper(btnDropdownRef.current, popoverDropdownRef.current, {
      placement: "left-start",
    });
    setDropdownPopoverShow(true);
  };

  const closeDropdownPopover = () => {
    setDropdownPopoverShow(false);
  };

  return (
    <>
      <button
        type="button"
        className="text-blueGray-500 py-1 px-3 focus:outline-none"
        ref={btnDropdownRef}
        aria-expanded={dropdownPopoverShow}
        aria-haspopup="true"
        onClick={() => {
          dropdownPopoverShow ? closeDropdownPopover() : openDropdownPopover();
        }}
      >
        <i className="fas fa-ellipsis-v" aria-hidden />
      </button>
      <div
        ref={popoverDropdownRef}
        className={
          (dropdownPopoverShow ? "block " : "hidden ") +
          "bg-white text-base z-50 float-left py-2 list-none text-left rounded shadow-lg min-w-48"
        }
      >
        <p className="text-sm py-2 px-4 text-blueGray-500">
          Demo table — no actions
        </p>
      </div>
    </>
  );
};

export default TableDropdown;
