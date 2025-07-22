import React, { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const EventForm = ({ event, onSave, onCancel }) => {
  const [formData, setFormData] = useState(() => {
    const initialData = {
      title: '',
      tagline: '',
      description: '',
      date: '',
      categories: [],
      ...(event || {}),
    };
    if (event) {
      initialData.date = event.date ? new Date(event.date).toISOString().split('T')[0] : '';
    }
    return initialData;
  });

  const [mainImageFile, setMainImageFile] = useState(null);
  const [galleryImageFiles, setGalleryImageFiles] = useState([]);

  const categoriesList = ['Sustainable Architecture', 'Workshop', 'Construction', 'Earth Building'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      const newCategories = checked
        ? [...prev.categories, value]
        : prev.categories.filter(cat => cat !== value);
      return { ...prev, categories: newCategories };
    });
  };

  const handleFileChange = (e) => {
    if (e.target.name === 'mainImage') {
      setMainImageFile(e.target.files[0]);
    } else {
      setGalleryImageFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submissionData = new FormData();

    Object.keys(formData).forEach(key => {
      if (key === 'categories') {
        formData.categories.forEach(category => {
          submissionData.append('categories[]', category);
        });
      } else {
        submissionData.append(key, formData[key]);
      }
    });

    if (mainImageFile) {
      submissionData.append('mainImage', mainImageFile);
    }

    if (galleryImageFiles.length > 0) {
      galleryImageFiles.forEach(file => {
        submissionData.append('galleryImages', file);
      });
    }

    onSave(submissionData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">{event ? 'Edit Event' : 'Add New Event'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Event Title" className="w-full p-2 border rounded" required />
          <input type="text" name="tagline" value={formData.tagline} onChange={handleChange} placeholder="Short Tagline or Quote" className="w-full p-2 border rounded" required />
          <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Detailed Description" className="w-full p-2 border rounded" rows="4" required />
          <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full p-2 border rounded" required />
          
          <div>
            <label className="block mb-2 font-semibold">Main Image</label>
            <input type="file" name="mainImage" onChange={handleFileChange} className="w-full p-2 border rounded" />
            {event && event.mainImage && !mainImageFile && <img src={event.mainImage} alt="Main" className="w-32 h-32 object-cover mt-2"/>}
          </div>

          <div>
            <label className="block mb-2 font-semibold">Gallery Images</label>
            <input type="file" name="galleryImages" onChange={handleFileChange} multiple className="w-full p-2 border rounded" />
             {event && event.galleryImages && <div className="flex flex-wrap gap-2 mt-2">{event.galleryImages.map(img => <img key={img} src={img} alt="Gallery" className="w-20 h-20 object-cover"/>)}</div>}
          </div>

          <div>
            <label className="block mb-2 font-semibold">Categories</label>
            <div className="grid grid-cols-2 gap-2">
              {categoriesList.map(cat => (
                <label key={cat} className="flex items-center space-x-2">
                  <input type="checkbox" value={cat} checked={formData.categories.includes(cat)} onChange={handleCategoryChange} />
                  <span>{cat}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700">Save Event</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/events`);
      if (!res.ok) throw new Error('Failed to fetch events');
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSave = async (eventData) => {
    const token = localStorage.getItem('adminToken');
    console.log('Auth Token being sent:', token);
    const method = editingEvent ? 'PUT' : 'POST';
    const url = editingEvent
      ? `${API_BASE}/events/${editingEvent._id}`
      : `${API_BASE}/events`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: eventData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to save event');
      }

      setIsModalOpen(false);
      setEditingEvent(null);
      fetchEvents(); // Refresh the list
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      const token = localStorage.getItem('adminToken');
      try {
        const res = await fetch(`${API_BASE}/events/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error('Failed to delete event');
        }
        fetchEvents(); // Refresh the list
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><div className="text-xl">Loading...</div></div>;
  if (error) return <div className="flex justify-center items-center h-screen"><div className="text-xl text-red-500">Error: {error}</div></div>;

  return (
    <div className="container mx-auto p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Manage Events</h1>
        <button
          onClick={() => {
            setEditingEvent(null);
            setIsModalOpen(true);
          }}
          className="bg-amber-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-amber-700 transition-colors duration-300"
        >
          Add New Event
        </button>
      </div>

      {isModalOpen && (
        <EventForm
          event={editingEvent}
          onSave={handleSave}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingEvent(null);
          }}
        />
      )}

      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categories</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {events.length > 0 ? (
              events.map(event => (
                <tr key={event._id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">{event.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{new Date(event.date).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-2">
                      {event.categories.map(cat => (
                        <span key={cat} className="px-2 py-1 text-xs font-semibold text-amber-800 bg-amber-100 rounded-full">{cat}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleEdit(event)} className="text-amber-600 hover:text-amber-900 mr-4">Edit</button>
                    <button onClick={() => handleDelete(event._id)} className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                  No events found. Add one to get started!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageEvents;
