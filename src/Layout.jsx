import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';

const Layout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-50">
      <Sidebar />
      <main className="flex-1 p-4 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
