import React from 'react';
import { useResponsive, useResponsiveNavigation } from '../hooks/useResponsive';

// Responsive Container
export const ResponsiveContainer = ({ children, className = '', maxWidth = 'max-w-7xl' }) => {
  return (
    <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${maxWidth} ${className}`}>
      {children}
    </div>
  );
};

// Responsive Grid
export const ResponsiveGrid = ({ 
  children, 
  columns = { mobile: 1, tablet: 2, desktop: 3, large: 4 },
  gap = 'gap-4',
  className = '' 
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
  };

  const responsiveClasses = [
    gridCols[columns.mobile] || 'grid-cols-1',
    `sm:${gridCols[columns.tablet] || 'grid-cols-2'}`,
    `lg:${gridCols[columns.desktop] || 'grid-cols-3'}`,
    `xl:${gridCols[columns.large] || 'grid-cols-4'}`,
  ].join(' ');

  return (
    <div className={`grid ${responsiveClasses} ${gap} ${className}`}>
      {children}
    </div>
  );
};

// Responsive Stack (vertical on mobile, horizontal on desktop)
export const ResponsiveStack = ({ children, className = '', spacing = 'space-y-4 lg:space-y-0 lg:space-x-4' }) => {
  return (
    <div className={`flex flex-col lg:flex-row ${spacing} ${className}`}>
      {children}
    </div>
  );
};

// Mobile-First Card
export const ResponsiveCard = ({ children, className = '', padding = 'p-4 lg:p-6' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${padding} ${className}`}>
      {children}
    </div>
  );
};

// Responsive Navigation Menu
export const ResponsiveNavMenu = ({ items = [], className = '' }) => {
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu, isMobile } = useResponsiveNavigation();

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Toggle navigation menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      )}

      {/* Desktop Menu */}
      <nav className={`hidden lg:flex lg:space-x-8 ${className}`}>
        {items.map((item, index) => (
          <a
            key={index}
            href={item.href}
            className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            {item.label}
          </a>
        ))}
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobile && isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={closeMobileMenu}
          />
          
          {/* Menu Panel */}
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out">
            <div className="p-6">
              <button
                onClick={closeMobileMenu}
                className="mb-6 p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <nav className="space-y-2">
                {items.map((item, index) => (
                  <a
                    key={index}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
          </div>
        </>
      )}
    </>
  );
};

// Responsive Table/List Toggle
export const ResponsiveDataView = ({ 
  data = [], 
  columns = [], 
  renderListItem,
  renderTableRow,
  className = '' 
}) => {
  const { isMobile } = useResponsive();

  if (isMobile && renderListItem) {
    return (
      <div className={`space-y-3 ${className}`}>
        {data.map((item, index) => renderListItem(item, index))}
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, index) => renderTableRow ? renderTableRow(item, index) : (
            <tr key={index}>
              {columns.map((column, colIndex) => (
                <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Responsive Sidebar Layout
export const ResponsiveSidebarLayout = ({ sidebar, children, className = '' }) => {
  return (
    <div className={`flex flex-col lg:flex-row min-h-screen ${className}`}>
      {/* Sidebar */}
      <aside className="w-full lg:w-64 lg:flex-shrink-0 bg-gray-50 border-r border-gray-200">
        {sidebar}
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
};

export default ResponsiveContainer;
