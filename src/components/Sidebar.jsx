import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiPlusCircle,
  FiGrid,
  FiMenu,
  FiX,
  FiLogOut,
  FiCalendar, FiBriefcase, FiFilm, FiUsers,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { to: "/admin", label: "Dashboard", icon: <FiHome /> },
  { to: "/admin/add-project", label: "Add Project", icon: <FiPlusCircle /> },
  { to: "/admin/manage-projects", label: "Manage Projects", icon: <FiGrid /> },
  { to: "/admin/manage-events", label: "Manage Events", icon: <FiCalendar /> },
  { to: "/admin/manage-careers", label: "Manage Careers", icon: <FiBriefcase /> },
  { to: "/admin/manage-films", label: "Manage Films", icon: <FiFilm /> },
  { to: "/admin/manage-team", label: "Manage Team", icon: <FiUsers /> },
];

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const username = localStorage.getItem("adminUsername");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUsername");
    navigate("/admin/login");
  };

  const sidebarVariants = {
    open: {
      x: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
    closed: {
      x: "-100%",
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-20 p-2 rounded-lg bg-white shadow-lg hover:bg-gray-100 transition-colors"
      >
        <FiMenu className="w-6 h-6 text-gray-700" />
      </button>

      <AnimatePresence>
        {/* Overlay */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
          />
        )}

        {/* Sidebar for Desktop */}
        <aside className="hidden lg:flex flex-col w-[280px] bg-white dark:bg-gray-800 shadow-lg">
          {/* Desktop Content */}
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">
                  {username?.[0]?.toUpperCase() || "A"}
                </span>
              </div>
              <div>
                <h2 className="font-bold text-xl text-gray-900 dark:text-white">
                  {username || "Admin"}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Administrator
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-2 flex flex-col">
            <div className="flex-grow">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200
                    ${
                      isActive
                        ? "bg-amber-50 text-amber-600 shadow-sm dark:bg-amber-900/10 dark:text-amber-500"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    }`
                  }
                >
                  <span className="text-xl">{l.icon}</span>
                  <span className="text-sm">{l.label}</span>
                </NavLink>
              ))}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 mt-4"
            >
              <span className="text-xl"><FiLogOut /></span>
              <span className="text-sm">Logout</span>
            </button>
          </nav>

          <div className="p-4 border-t dark:border-gray-700">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              Aagaur Admin © 2025
            </p>
          </div>
        </aside>

        {/* Mobile Sidebar */}
        <motion.aside
          initial="closed"
          animate={isOpen ? "open" : "closed"}
          exit="closed"
          variants={sidebarVariants}
          className="lg:hidden fixed inset-y-0 left-0 w-full sm:w-80 bg-white dark:bg-gray-800 shadow-xl flex flex-col z-40"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">
                  {username?.[0]?.toUpperCase() || "A"}
                </span>
              </div>
              <div>
                <h2 className="font-bold text-xl text-gray-900 dark:text-white">
                  {username || "Admin"}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Administrator
                </p>
              </div>
            </div>

            {/* Close button for mobile */}
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <FiX className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Navigation */}
          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2 flex flex-col">
            <div className="flex-grow">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200
                    ${
                      isActive
                        ? "bg-amber-50 text-amber-600 shadow-sm dark:bg-amber-900/10 dark:text-amber-500"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    }`
                  }
                >
                  <span className="text-xl">{l.icon}</span>
                  <span className="text-sm">{l.label}</span>
                </NavLink>
              ))}
            </div>
            {/* Logout Button for Mobile */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 mt-4"
            >
              <span className="text-xl"><FiLogOut /></span>
              <span className="text-sm">Logout</span>
            </button>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t dark:border-gray-700">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              Aagaur Admin © 2025
            </p>
          </div>
        </motion.aside>
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
