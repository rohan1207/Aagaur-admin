import React, { useEffect, useState } from 'react';
import { FiTrash2, FiPlus } from 'react-icons/fi';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const categories = ['Architecture', 'Interior', 'Event'];

const VideoFormModal = ({ onClose, onSave }) => {
  const [url, setUrl] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState(categories[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url || !date) return;
    onSave({ url, date, category });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-lg p-6 shadow-xl">
        <h2 className="text-xl font-semibold mb-4">Add New Video</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Iframe URL</label>
            <input
              type="text"
              className="w-full border rounded p-2"
              placeholder="<iframe ...></iframe>"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              className="w-full border rounded p-2"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              className="w-full border rounded p-2"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ManageFilms = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/videos`);
      if (!res.ok) throw new Error('Failed to fetch videos');
      const data = await res.json();
      setVideos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this video?')) return;
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${API_BASE}/videos/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to delete');
      fetchVideos();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSave = async (formData) => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${API_BASE}/videos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to add video');
      }
      setShowModal(false);
      fetchVideos();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Manage Films</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
        >
          <FiPlus /> Add New
        </button>
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div
              key={video._id}
              className="border rounded-lg overflow-hidden shadow relative"
            >
              <div className="aspect-video bg-neutral-100" dangerouslySetInnerHTML={{ __html: video.url }} />
              <div className="p-4 flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {new Date(video.date).toLocaleDateString()} – {video.category}
                </span>
                <button
                  onClick={() => handleDelete(video._id)}
                  className="p-2 text-red-600 hover:text-red-800"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <VideoFormModal onClose={() => setShowModal(false)} onSave={handleSave} />
      )}
    </div>
  );
};

export default ManageFilms;
