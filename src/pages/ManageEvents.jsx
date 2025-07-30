import React, { useState, useEffect } from 'react';
import imageCompression from 'browser-image-compression';

// --- Image Compression Logic ---
// This function takes a file, compresses it, and returns the compressed file.
const compressImage = async (file) => {
  const options = {
    maxSizeMB: 1,          // Max file size in MB
    maxWidthOrHeight: 1920, // Max width or height
    useWebWorker: true,    // Use web worker for better performance
  };

  try {
    console.log(`Original file size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
    const compressedFile = await imageCompression(file, options);
    console.log(`Compressed file size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
    return compressedFile;
  } catch (error) {
    console.error('Image compression failed:', error);
    return file; // Return original file if compression fails
  }
};

// --- HOW TO USE ---
// In your file input's onChange handler, you would do something like this:
/*
  const handleFileChange = async (event) => {
    const { name, files } = event.target;
    if (files && files.length > 0) {
      // For a single file input
      const compressedFile = await compressImage(files[0]);
      setFormData(prevState => ({ ...prevState, [name]: compressedFile }));

      // For a multiple file input
      const compressedFiles = await Promise.all(
        Array.from(files).map(file => compressImage(file))
      );
      setFormData(prevState => ({ ...prevState, [name]: compressedFiles }));
    }
  };
*/

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const EventForm = ({ event, onSave, onCancel, isSaving }) => {
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

  const categoriesList = ['Sustainable Architecture', 'Workshop', 'Construction', 'Earth Building','events'];

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

  const handleFileChange = async (e) => {
    const { name, files } = e.target;
    if (!files || files.length === 0) return;

    // Compress and set the files
    if (name === 'mainImage') {
      const compressed = await compressImage(files[0]);
      setMainImageFile(compressed);
    } else {
      setIsCompressing(true);
      try {
        const compressedFiles = await Promise.all(
          Array.from(files).map(async (file, idx) => {
            const compressedFile = await compressImage(file);
            const extension = file.name.split('.').pop();
            // Create a new File object with a unique name
            return new File([compressedFile], `gallery-${Date.now()}-${idx}.${extension}`, { type: compressedFile.type });
          })
        );
        setGalleryImageFiles(compressedFiles);
      } catch (error) {
        console.error('Error during image compression:', error);
        // toast.error('Failed to compress gallery images.');
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    if (isCompressing) {
      // toast.info('Please wait for images to finish compressing.');
      return;
    }
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
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
            <button type="submit" disabled={isSaving || isCompressing} className="px-4 py-2 rounded text-white bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 flex items-center justify-center">
              {isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {event ? 'Updating...' : 'Saving...'}
                </>
              ) : (event ? 'Update Event' : 'Save Event')}
            </button>
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
  const [isSaving, setIsSaving] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);

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
    setIsSaving(true);
    setError(null);
    console.log('Attempting to save event...');

    // Log FormData contents
    for (let [key, value] of eventData.entries()) {
      console.log(`${key}:`, value);
    }

    const token = localStorage.getItem('adminToken');
    const method = editingEvent ? 'PUT' : 'POST';
    const url = editingEvent
      ? `${API_BASE}/events/${editingEvent._id}`
      : `${API_BASE}/events`;

    console.log(`Sending ${method} request to ${url}`);

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: eventData,
      });

      const responseBody = await response.text(); // Read body as text to avoid JSON parsing errors on non-JSON responses
      console.log('Response Status:', response.status);
      console.log('Response Body:', responseBody);

      if (!response.ok) {
        let errorPayload = null;
        try {
          errorPayload = JSON.parse(responseBody); // Try to parse as JSON
        } catch (e) {
          // Not a JSON response
        }
        const errorMessage = errorPayload?.message || `HTTP error! Status: ${response.status}`;
        console.error('Save failed:', errorMessage);
        throw new Error(errorMessage);
      }

      console.log('Event saved successfully');
      setIsModalOpen(false);
      setEditingEvent(null);
      fetchEvents(); // Refresh the list
    } catch (err) {
      console.error('An error occurred during save:', err);
      setError(err.message);
    } finally {
      setIsSaving(false);
      console.log('Save attempt finished.');
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
    <div className="container mx-auto p-4 sm:p-8 bg-gray-50 min-h-screen mt-10">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Manage Events</h1>
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
          isSaving={isSaving}
          onSave={handleSave}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingEvent(null);
          }}
        />
      )}

      <div className="bg-white shadow-xl rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 hidden md:table">
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

        {/* Mobile Card View */}
        <div className="divide-y divide-gray-200 md:hidden">
          {events.length > 0 ? (
            events.map(event => (
              <div key={event._id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-lg text-gray-900">{event.title}</div>
                    <div className="text-sm text-gray-600 mt-1">{new Date(event.date).toLocaleDateString()}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                    <button onClick={() => handleEdit(event)} className="text-amber-600 hover:text-amber-900 p-1">Edit</button>
                    <button onClick={() => handleDelete(event._id)} className="text-red-600 hover:text-red-900 p-1">Delete</button>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {event.categories.map(cat => (
                    <span key={cat} className="px-2 py-1 text-xs font-semibold text-amber-800 bg-amber-100 rounded-full">{cat}</span>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-12 text-center text-gray-500">
              No events found. Add one to get started!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageEvents;
