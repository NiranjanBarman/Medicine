// src/components/Sidebar.jsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const [isOpen] = useState(true); // Sidebar is always open as per your current setup
  const [activeSubMenu, setActiveSubMenu] = useState(null); // State to manage which sub-menu is open
  const location = useLocation(); // Get current location to highlight active link

  // Define consistent Tailwind classes for links
  const linkClass = "flex items-center text-sm font-medium py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 ease-in-out cursor-pointer";
  const activeLinkClass = "bg-blue-700 text-white shadow-inner"; // For active link/page
  const subLinkClass = "flex items-center text-xs py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors duration-200 ease-in-out cursor-pointer"; // Styling for sub-menu links
  const activeSubLinkClass = "bg-blue-600 text-white"; // For active sub-menu link

  // Define your navigation items with sub-menus
  const navItems = [
    { name: "DASHBOARD", path: "/", abbreviation: "PR" },
    {
      name: "MASTER",
      path: "/AddEditItemMedicine", // A common base path for item master related pages (e.g., if "/" itself is a dashboard)
      abbreviation: "MS",
      subItems: [
        { name: "ITEM MASTER", path: "/AddEditItemMedicine" },
        { name: "ADD VENDOR", path: "/vendor" },
        { name: "ADD MANUFRACTURER", path: "/manufacturer" },
        { name: "ADD GENERIC", path: "/generic" },
      ],
    },
    { name: "PURCHASE RECEIVE", path: "/purchases-data", abbreviation: "PR" },
    { name: "VENDOR WISE RETURN", path: "/vendor-return", abbreviation: "VR" },
    { name: "ITEM WISE RETURN", path: "/return-form", abbreviation: "IR" },
    { name: "ADVANCE RECEIPT", path: "/advance-receipt", abbreviation: "AR" },
    { name: "BULK PAYMENT", path: "/bulk-payment", abbreviation: "BP" },
    { name: "GCR WISE PAYMENT", path: "/grc-payment", abbreviation: "GCR" },
    { name: "COUNTER SALE", path: "/counter-sale", abbreviation: "CS" },
    { name: "INDOOR SALE", path: "/indoor-sale", abbreviation: "IS" },
    { name: "SALE RETURN", path: "/sale-return", abbreviation: "SR" },
  ];

  // Function to check if a main link or any of its sub-links are active
  const isLinkActive = (item) => { // Now accepts the full item object
    // If it's a parent item with sub-items
    if (item.subItems) {
      // Check if the current path exactly matches the parent's base path
      // OR if any of its sub-items' paths exactly match the current path
      return (
        location.pathname === item.path ||
        item.subItems.some(subItem => location.pathname === subItem.path)
      );
    }
    // For direct links (no sub-items), check for exact path match
    return location.pathname === item.path;
  };

  // Toggle sub-menu visibility
  const handleSubMenuToggle = (itemName) => {
    setActiveSubMenu(activeSubMenu === itemName ? null : itemName);
  };

  return (
    <div
      className={`transition-all duration-300 ease-in-out shadow-lg bg-gray-800 text-white
        ${isOpen ? "w-64" : "w-16"}
        flex flex-col min-h-screen`}
    >

      {/* Navigation Links */}
      <nav className="mt-6 flex-1 px-3 overflow-y-auto">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.name}>
              {item.subItems ? (
                // Render main link with sub-menu toggle
                <>
                  <div
                    className={`${linkClass} ${isLinkActive(item) ? activeLinkClass : ''} flex justify-between items-center`} // Passed item object
                  >
                    {/* Link for navigation */}
                    <Link
                      to={item.path}
                      className="flex-1 py-2.5 -ml-4 pl-4 pr-2"
                      onClick={() => setActiveSubMenu(null)}
                    >
                      {isOpen ? item.name : item.abbreviation}
                    </Link>

                    {/* Arrow for sub-menu toggle */}
                    {isOpen && (
                      <span className="ml-auto p-2" onClick={() => handleSubMenuToggle(item.name)}>
                        {activeSubMenu === item.name ? (
                          // Up arrow SVG
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        ) : (
                          // Down arrow SVG
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        )}
                      </span>
                    )}
                  </div>
                  {/* Render sub-menu if active and sidebar is open */}
                  {isOpen && activeSubMenu === item.name && (
                    <ul className="ml-4 mt-1 space-y-1 border-l border-blue-500 pl-2">
                      {item.subItems.map((subItem) => (
                        <li key={subItem.name}>
                          <Link
                            to={subItem.path}
                            className={`${subLinkClass} ${location.pathname === subItem.path ? activeSubLinkClass : ''}`}
                            onClick={() => setActiveSubMenu(item.name)} // Keep parent sub-menu open when a sub-item is clicked
                          >
                            {subItem.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                // Render direct link
                <Link
                  to={item.path}
                  className={`${linkClass} ${isLinkActive(item) ? activeLinkClass : ''}`} // Passed item object
                  onClick={() => setActiveSubMenu(null)} // Close any open sub-menus when a direct link is clicked
                >
                  {isOpen ? item.name : item.abbreviation}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Optional: Footer section for sidebar (e.g., copyright, version) */}
      <div className="mt-auto p-3 text-xs text-gray-400 border-t border-gray-700">
        {isOpen ? "© 2025 Medical Items" : "©"}
      </div>
    </div>
  );
};

export default Sidebar;