import React, { useContext } from "react";
import { SIDE_MENU_DATA } from "../../utils/data";
import { UserContext } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import CharAvatar from "../Cards/CharAvatar";
import ThemeToggle from "../ThemeToggle";
import { useResponsive } from "../../hooks/useResponsive";

const SideMenu = ({ activeMenu, showDate = false }) => {
  const { user, clearUser } = useContext(UserContext);
  const { isMobile, isTablet } = useResponsive();
  const navigate = useNavigate();

  const handleClick = (route) => {
    if (route === "logout") {
      handleLogout();
      return;
    }

    navigate(route);
  };

  const handleLogout = () => {
    localStorage.clear();
    clearUser();
    navigate("/login");
  };

  // Format current date for mobile/tablet
  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div 
      className="w-64 h-[calc(100vh-61px)] border-r sticky top-[61px] z-20 flex flex-col transition-colors"
      style={{
        backgroundColor: 'var(--color-sidebarBackground)',
        borderColor: 'var(--color-borderLight)'
      }}
    >
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto p-5">
        {/* Date display for mobile/tablet */}
        {showDate && (isMobile || isTablet) && (
          <div 
            className="mb-4 p-3 rounded-lg transition-colors"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            <p 
              className="text-sm font-medium text-center transition-colors"
              style={{ color: 'var(--color-textPrimary)' }}
            >
              📅 {getCurrentDate()}
            </p>
          </div>
        )}

        {/* Theme toggle for mobile */}
        {(isMobile || isTablet) && (
          <div className="mb-4 flex justify-center">
            <ThemeToggle />
          </div>
        )}

        <div 
          className="flex flex-col items-center justify-center gap-3 mt-3 mb-7 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate('/profile')}
        >
          {user?.profileImageUrl ? (
            <img
              src={
                user?.profileImageUrl?.startsWith("http")
                  ? user.profileImageUrl
                  : `${import.meta.env.VITE_API_BASE_URL}${user.profileImageUrl}`
              }
              alt="Profile Image"
              className="w-20 h-20 bg-slate-400 rounded-full object-cover"
            />
          ) : (
            <CharAvatar
              fullName={user?.fullName}
              width="w-20"
              height="h-20"
              style="text-xl"
            />
          )}

          <h5 
            className="font-bold leading-6 text-center transition-colors"
            style={{ color: 'var(--color-textPrimary)' }}
          >
            {user?.fullName || ""}
          </h5>
        </div>
        
        {/* Menu items */}
        <div className="space-y-3">
          {SIDE_MENU_DATA.map((item, index) => (
            <button
              key={`menu_${index}`}
              className={`w-full flex items-center font-semibold gap-4 text-[15px] py-3 px-6 rounded-lg transition-colors duration-200 ${
                activeMenu == item.label
                  ? "font-bold text-[18px]"
                  : ""
              }`}
              style={
                activeMenu == item.label
                  ? {
                      backgroundColor: 'var(--color-primary)',
                      color: 'var(--color-textWhite)'
                    }
                  : {
                      color: 'var(--color-textPrimary)',
                      backgroundColor: 'transparent'
                    }
              }
              onMouseEnter={(e) => {
                if (activeMenu !== item.label) {
                  e.target.style.backgroundColor = 'var(--color-accent)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeMenu !== item.label) {
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
              onClick={() => handleClick(item.path)}
            >
              <item.icon className="" />
              {item.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Fixed copyright at bottom */}
      <div 
        className="border-t p-4 transition-colors"
        style={{
          borderColor: 'var(--color-borderLight)',
          backgroundColor: 'var(--color-accent)'
        }}
      >
        <div className="text-center">
          <p 
            className="text-xs font-medium mb-1 transition-colors"
            style={{ color: 'var(--color-textPrimary)' }}
          >
            <span 
              className="font-black"
              style={{ color: 'var(--color-primary)' }}
            >
              Luka
            </span>
            Tech
          </p>
          <p 
            className="text-xs transition-colors"
            style={{ color: 'var(--color-textSecondary)' }}
          >
            © 2025 All rights reserved
          </p>
          <p 
            className="text-[10px] mt-1 transition-colors"
            style={{ color: 'var(--color-textMuted)' }}
          >
            Version 1.0.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default SideMenu;
