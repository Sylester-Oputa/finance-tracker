import React from "react";
import { useState } from "react";
import { HiOutlineX, HiOutlineMenu } from "react-icons/hi";
import SideMenu from "./SideMenu";
import { Link } from "react-router-dom";

const Navbar = ({ activeMenu }) => {
  const [openSideMenu, setOpenSideMenu] = useState(false);
  return (
    <div
      className="flex gap-5 bg-[#FFFAE5] border border-b border-[#935F4C] backdrop-blur-[2px] py-4 px-7 sticky top-0 z-30"
    >
      <button
        className="block lg:hidden text-[#181821]"
        onClick={() => {
          setOpenSideMenu(!openSideMenu);
        }}
      >
        {openSideMenu ? (
          <HiOutlineX className="text-2xl" />
        ) : (
          <HiOutlineMenu className="text-2xl" />
        )}
      </button>

      <Link to="/">
        <h2 className="text-xl font-bold text-[#181821]">Expense Tracker</h2>
      </Link>

      {openSideMenu && (
        <div className="fixed top-[61px] -ml-5 bg-[#181821]">
          <SideMenu activeMenu={activeMenu} />
        </div>
      )}
    </div>
  );
};

export default Navbar;
