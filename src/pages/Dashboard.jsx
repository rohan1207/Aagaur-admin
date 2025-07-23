import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../utils/api';

// SVG Icon Components
const ProjectIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

const EventIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const VideoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
  </svg>
);

const StatItem = ({ label, value, to, icon }) => (
  <Link
    to={to}
    className="block bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all p-4 sm:p-6 cursor-pointer hover:scale-[1.02]"
  >
    <div className="flex items-center space-x-4">
      <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full">
        {icon}
      </div>
      <div className="text-left">
        <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{value}</div>
        <div className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">{label}</div>
      </div>
    </div>
  </Link>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [projects, events, videos] = await Promise.all([
          apiFetch('/projects'),
          apiFetch('/events'),
          apiFetch('/videos'),
        ]);
        setStats({
          projects: projects.length,
          events: events.length,
          videos: videos.length,
        });
      } catch (err) {
        setError(err.message || 'Failed to load stats');
      }
    };
    load();
  }, []);

  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!stats) return <div className="p-4 text-center">Loading dashboard...</div>;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto mt-10">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800 dark:text-white">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <StatItem 
          label="Projects" 
          value={stats.projects} 
          to="/admin/manage-projects" 
          icon={<ProjectIcon />}
        />
        <StatItem 
          label="Events" 
          value={stats.events} 
          to="/admin/manage-events" 
          icon={<EventIcon />}
        />
        <StatItem 
          label="Videos" 
          value={stats.videos} 
          to="/admin/manage-films" 
          icon={<VideoIcon />}
        />
      </div>
    </div>
  );
};

export default Dashboard;
