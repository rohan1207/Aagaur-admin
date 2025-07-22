import React, { useState, useEffect, useMemo } from 'react';
import { Loader2, Edit, Trash2, Search, X, PlusCircle } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

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
          <X className="w-5 h-5 text-red-500 hover:text-red-700" />
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

const ProjectFormModal = ({ project, onSave, onCancel, isLoading }) => {
  const [form, setForm] = useState({});
  const [mainImage, setMainImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);

  useEffect(() => {
    if (project) {
      const initialForm = {
        ...project,
        keyFeatures: (project.keyFeatures || []).map((v, i) => ({ id: i, value: v })),
        materialsUsed: (project.materialsUsed || []).map((v, i) => ({ id: i, value: v })),
        seoTags: (project.seoTags || []).map((v, i) => ({ id: i, value: v })),
        area: project.area || { value: '', unit: 'sq.ft.' },
        quote: project.quote || { text: '', author: '' },
      };
      setForm(initialForm);
      setMainImage(null);
      setGalleryImages([]);
    } else {
      setForm({});
    }
  }, [project]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setForm(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDynamicListChange = (e, index, field) => {
    const newList = [...form[field]];
    newList[index].value = e.target.value;
    setForm(prev => ({ ...prev, [field]: newList }));
  };

  const addDynamicListItem = (field) => {
    setForm(prev => ({ ...prev, [field]: [...(prev[field] || []), { id: Date.now(), value: '' }] }));
  };

  const removeDynamicListItem = (index, field) => {
    const newList = [...form[field]];
    newList.splice(index, 1);
    setForm(prev => ({ ...prev, [field]: newList }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();

    Object.keys(form).forEach(key => {
      if (['keyFeatures', 'materialsUsed', 'seoTags'].includes(key)) {
        formData.append(key, JSON.stringify(form[key].map(item => item.value)));
      } else if (key === 'area' || key === 'quote') {
        formData.append(key, JSON.stringify(form[key]));
      } else if (key !== '_id' && key !== '__v' && key !== 'mainImage' && key !== 'galleryImages') {
        formData.append(key, form[key]);
      }
    });

    if (mainImage) {
      formData.append('mainImage', mainImage);
    }
    if (galleryImages.length > 0) {
      galleryImages.forEach(file => formData.append('galleryImages', file));
    }

    onSave(formData, project._id);
  };

  if (!project) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
        <h2 className="text-3xl font-bold mb-6">Edit Project</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* All fields from AddProject.jsx */}
          <input type="text" name="title" value={form.title || ''} onChange={handleChange} placeholder="Project Title" className="w-full p-3 border rounded" required />
          <input type="text" name="subtitle" value={form.subtitle || ''} onChange={handleChange} placeholder="Subtitle" className="w-full p-3 border rounded" />
          <input type="text" name="location" value={form.location || ''} onChange={handleChange} placeholder="Location" className="w-full p-3 border rounded" />
          <input type="text" name="client" value={form.client || ''} onChange={handleChange} placeholder="Client" className="w-full p-3 border rounded" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <select name="category" value={form.category || ''} onChange={handleChange} className="w-full p-3 border rounded"><option value="" disabled>Category</option><option value="Architecture">Architecture</option><option value="Interior">Interior</option></select>
            <select name="status" value={form.status || ''} onChange={handleChange} className="w-full p-3 border rounded"><option value="Completed">Completed</option><option value="Ongoing">Ongoing</option></select>
            <input type="number" name="year" value={form.year || ''} onChange={handleChange} placeholder="Year" className="w-full p-3 border rounded" />
          </div>
          <textarea name="description" value={form.description || ''} onChange={handleChange} placeholder="Description" className="w-full p-3 border rounded" rows="5" />
          
          <DynamicListInput label="Key Features" field="keyFeatures" list={form.keyFeatures || []} onListChange={handleDynamicListChange} onAddItem={addDynamicListItem} onRemoveItem={removeDynamicListItem} />
          <DynamicListInput label="Materials Used" field="materialsUsed" list={form.materialsUsed || []} onListChange={handleDynamicListChange} onAddItem={addDynamicListItem} onRemoveItem={removeDynamicListItem} />
          
          <div>
            <label>Main Image</label>
            <input type="file" onChange={(e) => setMainImage(e.target.files[0])} className="w-full p-3 border rounded" />
            {project.mainImage && <img src={project.mainImage} alt="Main" className="w-32 h-32 object-cover mt-2"/>}
          </div>
          <div>
            <label>Gallery Images</label>
            <input type="file" multiple onChange={(e) => setGalleryImages(Array.from(e.target.files))} className="w-full p-3 border rounded" />
            <div className="flex flex-wrap gap-2 mt-2">{project.galleryImages && project.galleryImages.map(img => <img key={img} src={img} alt="Gallery" className="w-20 h-20 object-cover"/>)}</div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onCancel} className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-6 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 flex items-center">
              {isLoading && <Loader2 className="w-5 h-5 animate-spin mr-2" />} Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


const ManageProject = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch(`${API_BASE}/projects`);
        if (!res.ok) throw new Error('Failed to fetch projects');
        const data = await res.json();
        setProjects(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleEdit = (project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      const token = localStorage.getItem('adminToken');
      try {
        const res = await fetch(`${API_BASE}/projects/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to delete');
        setProjects(projects.filter(p => p._id !== id));
      } catch (err) {
        setError('Failed to delete project: ' + err.message);
      }
    }
  };

  const handleSave = async (formData, id) => {
    const token = localStorage.getItem('adminToken');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/projects/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData, // FormData sets its own Content-Type
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update project');
      }
      const updatedProject = await res.json();
      setProjects(projects.map(p => p._id === id ? updatedProject : p));
      setIsModalOpen(false);
      setEditingProject(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

    const filteredProjects = useMemo(() => {
    return projects
      .filter(p => categoryFilter === 'All' || p.category === categoryFilter)
      .filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [projects, searchTerm, categoryFilter]);

  if (loading && !projects.length) return <div className="flex justify-center items-center h-screen"><Loader2 className="w-12 h-12 animate-spin" /></div>;
  if (error) return <div className="text-center py-10 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Manage Projects</h1>

      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow">
        <div className="relative w-1/2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text"
            placeholder="Search by title..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full p-2 pl-10 border rounded-lg"
          />
        </div>
        <div className="flex items-center space-x-2">
          {['All', 'Architecture', 'Interior'].map(cat => (
            <button 
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${categoryFilter === cat ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <ProjectFormModal 
          project={editingProject} 
          onSave={handleSave} 
          onCancel={() => setIsModalOpen(false)} 
          isLoading={loading}
        />
      )}

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProjects.map(project => (
              <tr key={project._id}>
                <td className="px-6 py-4 whitespace-nowrap"><div className="font-semibold">{project.title}</div><div className="text-sm text-gray-500">{project.subtitle}</div></td>
                                <td className="px-6 py-4"><span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">{project.category}</span></td>
                <td className="px-6 py-4">{project.year}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleEdit(project)} className="text-amber-600 hover:text-amber-900 mr-4"><Edit className="w-5 h-5" /></button>
                  <button onClick={() => handleDelete(project._id)} className="text-red-600 hover:text-red-900"><Trash2 className="w-5 h-5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageProject;
