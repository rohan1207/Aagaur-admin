import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../utils/api';

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
  if (!stats) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatItem 
          label="Projects" 
          value={stats.projects} 
          to="/admin/manage-projects" 
          icon="📋"
        />
        <StatItem 
          label="Events" 
          value={stats.events} 
          to="/admin/manage-events" 
          icon="🎉"
        />
        <StatItem 
          label="Videos" 
          value={stats.videos} 
          to="/admin/manage-films" 
          icon="🎥"
        />
      </div>
    </div>
  );
};

const StatItem = ({ label, value, to, icon }) => (
  <Link
    to={to}
    className="block bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition-all p-6 cursor-pointer hover:scale-[1.02]"
  >
    <div className="flex items-center">
      <div className="text-4xl mr-4">{icon}</div>
      <div className="text-left">
        <div className="text-3xl font-bold text-gray-900 dark:text-white">{value}</div>
        <div className="text-gray-500 dark:text-gray-400 text-sm font-medium">{label}</div>
      </div>
    </div>
  </Link>
);

export default Dashboard;
