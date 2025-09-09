import React, { useContext } from "react";
import { useState } from "react";
import { HiOutlineX, HiOutlineMenu } from "react-icons/hi";
import SideMenu from "./SideMenu";
import ThemeToggle from "../ThemeToggle";
import { Link } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
import { useResponsive } from "../../hooks/useResponsive";

const Navbar = ({ activeMenu }) => {
  const [openSideMenu, setOpenSideMenu] = useState(false);
  const { user } = useContext(UserContext);
  const { isMobile, isTablet } = useResponsive();

  // Format current date
  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: isMobile ? 'short' : 'long',
      year: 'numeric',
      month: isMobile ? 'short' : 'long',
      day: 'numeric'
    });
  };

  return (
    <div 
      className="flex gap-5 border-b backdrop-blur-[2px] py-4 px-7 sticky top-0 z-30 transition-colors"
      style={{
        backgroundColor: 'var(--color-navbarBackground)',
        borderColor: 'var(--color-border)'
      }}
    >
      <button
        className="block lg:hidden transition-colors"
        style={{ color: 'var(--color-textPrimary)' }}
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
        <h2 
          className="text-xl font-bold transition-colors"
          style={{ color: 'var(--color-textPrimary)' }}
        >
          Expense Tracker
        </h2>
      </Link>

      <div className="ml-auto flex items-center gap-4">
        {/* Date Display - Hidden on mobile/tablet, shown in sidebar instead */}
        {!isMobile && !isTablet && (
          <p 
            className="text-sm font-medium transition-colors"
            style={{ color: 'var(--color-textPrimary)' }}
          >
            {getCurrentDate()}
          </p>
        )}
        
        {/* Theme Toggle */}
        <ThemeToggle className="hidden md:flex" />
      </div>

      {openSideMenu && (
        <div 
          className="fixed top-[61px] -ml-5 transition-colors"
          style={{ backgroundColor: 'var(--color-sidebarBackground)' }}
        >
          <SideMenu activeMenu={activeMenu} showDate={isMobile || isTablet} />
        </div>
      )}
    </div>
  );
};

export default Navbar;
