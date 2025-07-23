import React, { useState, useEffect } from 'react';
import { Loader2, Upload, Image, PlusCircle, XCircle, CheckCircle, AlertCircle } from 'lucide-react';

// Define DynamicListInput outside the AddProject component and wrap with React.memo
// This prevents it from being re-created on every render, fixing the focus loss issue.
const DynamicListInput = React.memo(({ label, field, list, onListChange, onAddItem, onRemoveItem }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-slate-700">{label}</label>
    {list.map((item, index) => (
      <div key={item.id} className="flex items-center gap-2">
        <input
          type="text"
          value={item.value}
          onChange={(e) => onListChange(e, index, field)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-slate-500 focus:border-slate-500"
        />
        <button type="button" onClick={() => onRemoveItem(index, field)}>
          <XCircle className="w-5 h-5 text-red-500 hover:text-red-700" />
        </button>
      </div>
    ))}
    <button
      type="button"
      onClick={() => onAddItem(field)}
      className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-800"
    >
      <PlusCircle className="w-4 h-4" />
      Add More
    </button>
  </div>
));

const AddProject = () => {
  const initialFormState = {
    title: '',
    subtitle: '',
    location: '',
    projectType: '',
    category: 'Architecture',
    status: 'Completed',
    year: new Date().getFullYear(),
    area: { value: '', unit: 'sq.ft.' },
    client: '',
    description: '',
    keyFeatures: [{ id: 1, value: '' }],
    materialsUsed: [{ id: 1, value: '' }],
    quote: { text: '', author: '' },

  };

  const [form, setForm] = useState(initialFormState);
  const [mainImage, setMainImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState('success');

  // Basic styling for inputs to be reusable
  const styles = `
    .input {
      width: 100%;
      padding: 0.5rem 1rem;
      border: 1px solid #cbd5e1; /* slate-300 */
      border-radius: 0.5rem; /* rounded-lg */
      transition: all 0.2s;
    }
    .input:focus {
      --tw-ring-color: #64748b; /* slate-500 */
      --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
      --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color);
      box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
      border-color: #64748b; /* slate-500 */
    }
  `;

  // Inject styles only once, safely
  useEffect(() => {
    if (typeof window !== 'undefined' && !document.getElementById('add-project-styles')) {
      const styleSheet = document.createElement("style");
      styleSheet.type = "text/css";
      styleSheet.id = 'add-project-styles';
      styleSheet.innerText = styles;
      document.head.appendChild(styleSheet);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setForm((prev) => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDynamicListChange = (e, index, field) => {
    const newList = [...form[field]];
    newList[index].value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: newList }));
  };

  const addDynamicListItem = (field) => {
    setForm((prev) => ({
      ...prev,
      [field]: [...prev[field], { id: Date.now(), value: '' }],
    }));
  };

  const removeDynamicListItem = (index, field) => {
    const newList = [...form[field]];
    newList.splice(index, 1);
    setForm((prev) => ({ ...prev, [field]: newList }));
  };

  const showSweetAlert = (type, message) => {
    setAlertType(type);
    setMessage(message);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mainImage) {
      showSweetAlert('error', 'Main image is required.');
      return;
    }

    setIsLoading(true);
    const controller = new AbortController();
    const signal = controller.signal;
    // Record start time to measure upload duration
    const startTime = Date.now();

    // Allow up to 5 minutes for large uploads before aborting
    const timeoutMs = 5 * 60 * 1000; // 300 000 ms
    const timeoutId = setTimeout(() => {
      console.warn(`Upload aborted after ${timeoutMs / 1000}s timeout`);
      controller.abort();
    }, timeoutMs);

    const fd = new FormData();
    Object.keys(form).forEach((key) => {
      if (key === 'keyFeatures' || key === 'materialsUsed') {
        fd.append(key, JSON.stringify(form[key].map(item => item.value).filter(Boolean)));
      } else if (Array.isArray(form[key])) {
        fd.append(key, JSON.stringify(form[key]));
      } else if (typeof form[key] === 'object' && form[key] !== null) {
        fd.append(key, JSON.stringify(form[key]));
      } else {
        fd.append(key, form[key]);
      }
    });

    if (mainImage) fd.append('mainImage', mainImage);
    galleryImages.forEach((file) => fd.append('galleryImages', file));

    try {
      const token = localStorage.getItem('adminToken');
      console.log('Submitting project...');

      const res = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
        signal
      });

      clearTimeout(timeoutId);
      console.log('Project POST response:', res.status);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error adding project');
      }

      showSweetAlert('success', 'Project added successfully!');
      setForm(initialFormState);
      setMainImage(null);
      setGalleryImages([]);
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        showSweetAlert('error', 'Request timed out. Try again or check your connection.');
      } else {
        showSweetAlert('error', err.message || 'Failed to add project.');
      }
      console.error('Project add error:', err);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 mt-10">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">Add New Project</h1>

        {showAlert && (
          <div className={`fixed top-5 right-5 flex items-center gap-4 p-4 rounded-lg shadow-lg text-white ${alertType === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
            {alertType === 'success' ? <CheckCircle /> : <AlertCircle />}
            <span>{message}</span>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-8">
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Title*</label>
                  <input type="text" name="title" value={form.title} onChange={handleChange} className="w-full input" required />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Subtitle</label>
                  <input type="text" name="subtitle" value={form.subtitle} onChange={handleChange} className="w-full input" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Location</label>
                <input type="text" name="location" value={form.location} onChange={handleChange} className="w-full input" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Project Type</label>
                  <input type="text" name="projectType" value={form.projectType} onChange={handleChange} placeholder="e.g., Residential" className="w-full input" />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Category*</label>
                  <select name="category" value={form.category} onChange={handleChange} className="w-full input" required>
                    <option value="Architecture">Architecture</option>
                    <option value="Interior">Interior</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Status</label>
                  <select name="status" value={form.status} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-slate-500 focus:border-slate-500">
                    <option value="Completed">Completed</option>
                    <option value="Ongoing">Ongoing</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Year</label>
                  <input type="number" name="year" value={form.year} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-slate-500 focus:border-slate-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Area</label>
                  <div className="flex items-center gap-2">
                    <input type="number" name="area.value" value={form.area.value} onChange={handleChange} className="w-full input" />
                    <input type="text" name="area.unit" value={form.area.unit} onChange={handleChange} className="w-1/3 input" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Client (Optional)</label>
                  <input type="text" name="client" value={form.client} onChange={handleChange} className="w-full input" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Description*</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows="5" className="w-full input" required></textarea>
              </div>

              <DynamicListInput 
                label="Key Features" 
                field="keyFeatures" 
                list={form.keyFeatures} 
                onListChange={handleDynamicListChange} 
                onAddItem={addDynamicListItem} 
                onRemoveItem={removeDynamicListItem} 
              />

              <DynamicListInput 
                label="Materials Used" 
                field="materialsUsed" 
                list={form.materialsUsed} 
                onListChange={handleDynamicListChange} 
                onAddItem={addDynamicListItem} 
                onRemoveItem={removeDynamicListItem} 
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Quote</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input type="text" name="quote.text" value={form.quote.text} onChange={handleChange} placeholder="Quote text" className="w-full input" />
                  <input type="text" name="quote.author" value={form.quote.author} onChange={handleChange} placeholder="Author" className="w-full input" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Main Image*</label>
                  <div className="relative">
                    <input type="file" accept="image/*" onChange={(e) => setMainImage(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" required />
                    <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 hover:bg-slate-100">
                      <div className="text-center">
                        <Image className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                        <p className="text-sm text-slate-600">{mainImage ? mainImage.name : 'Click to upload main image'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Gallery Images</label>
                  <div className="relative">
                    <input type="file" multiple accept="image/*" onChange={(e) => setGalleryImages(Array.from(e.target.files))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <div className="flex items-center justify-center w-full h-24 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 hover:bg-slate-100">
                      <div className="text-center">
                        <Upload className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                        <p className="text-sm text-slate-600">{galleryImages.length > 0 ? `${galleryImages.length} file(s) selected` : 'Click to upload gallery images'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button type="submit" disabled={isLoading} className={`w-full py-4 px-6 rounded-lg font-medium text-white transition-all duration-200 transform ${
                  isLoading
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl'
                }`}>
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Adding Project...</span>
                    </div>
                  ) : 'Add Project'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProject;