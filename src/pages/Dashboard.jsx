import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { compressImage } from '../utils/compressImage';

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

const InternIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7-7h14a7 7 0 00-7 7z" />
  </svg>
);

const TeamIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7-7h14a7 7 0 00-7 7z" />
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

const HeroImageManager = () => {
  const [heroImage, setHeroImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchHeroImage = async () => {
      try {
        const data = await apiFetch('/hero-image');
        setHeroImage(data.imageUrl);
      } catch (err) {
        console.log('No hero image found, which is okay.');
      }
    };
    fetchHeroImage();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setError('');
      setSuccess('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an image first.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

        try {
      const compressedFile = await compressImage(selectedFile);
      
      const formData = new FormData();
      formData.append('image', compressedFile, compressedFile.name);

      const updatedImage = await apiFetch('/hero-image', {
        method: 'PUT',
        body: formData,
      });

      setHeroImage(updatedImage.imageUrl);
      setSuccess('Hero image updated successfully!');
      setSelectedFile(null);
      setPreview(null);
    } catch (err) {
      setError(err.message || 'Failed to update hero image.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800 dark:text-white">Manage Home Page Hero Image</h2>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-lg mb-2">Current Hero Image</h3>
            {heroImage ? (
              <img src={heroImage} alt="Current Hero" className="w-full h-auto rounded-lg shadow" />
            ) : (
              <p className="text-gray-500">No hero image set.</p>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">Upload New Image</h3>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {preview && (
              <div className="mt-4">
                <p className="font-semibold mb-2">New Image Preview:</p>
                <img src={preview} alt="New hero preview" className="w-full h-auto rounded-lg shadow" />
              </div>
            )}
            <button
              onClick={handleUpload}
              disabled={loading || !selectedFile}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 ease-in-out disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Uploading...' : 'Update Image'}
            </button>
            {error && <p className="text-red-500 mt-2">{error}</p>}
            {success && <p className="text-green-500 mt-2">{success}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [projects, events, videos, interns, team] = await Promise.all([
          apiFetch('/projects'),
          apiFetch('/events'),
          apiFetch('/videos'),
          apiFetch('/team/interns'),
          apiFetch('/team/members'),
        ]);
        setStats({
          projects: projects.length,
          events: events.length,
          videos: videos.length,
          interns: interns.length,
          team: team.length,
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

        <StatItem 
          label="Interns" 
          value={stats.interns} 
          to="/admin/manage-interns" 
          icon={<InternIcon />}
        />
        <StatItem 
          label="Team Members" 
          value={stats.team} 
          to="/admin/manage-team" 
          icon={<TeamIcon />}
        />
      </div>
      <HeroImageManager />
    </div>
  );
};

export default Dashboard;
