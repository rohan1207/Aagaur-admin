import React, { useState, useEffect } from 'react';
import { Loader2, PlusCircle, Check, X, ToggleRight, ToggleLeft, Edit, Trash2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const AddOpeningModal = ({ onClose, onSave, isSaving, opening = null }) => {
  const initial = opening ? { ...opening } : {
    position: '',
    shortDescription: '',
    location: '',
    salaryRange: '',
    immediateJoiner: false,
    employmentType: 'Full Time',
  };
  const [form, setForm] = useState(initial);

  // keep form in sync when editing
  useEffect(()=>{
    if(opening){
      setForm(opening);
    }
  },[opening]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form, opening?._id);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 sm:p-8 relative">
        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-semibold mb-6">Add Job Opening</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="position"
            value={form.position}
            onChange={handleChange}
            placeholder="Position name"
            className="w-full border p-3 rounded"
            required
          />
          <textarea
            name="shortDescription"
            value={form.shortDescription}
            onChange={handleChange}
            placeholder="Short description"
            className="w-full border p-3 rounded"
            rows="3"
          />
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Location"
            className="w-full border p-3 rounded"
          />
          <input
            type="text"
            name="salaryRange"
            value={form.salaryRange}
            onChange={handleChange}
            placeholder="Salary range"
            className="w-full border p-3 rounded"
          />
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Immediate joiner?</span>
            <input
              type="checkbox"
              name="immediateJoiner"
              checked={form.immediateJoiner}
              onChange={handleChange}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Employment Type</label>
            <select
              name="employmentType"
              value={form.employmentType}
              onChange={handleChange}
              className="border p-2 rounded"
            >
              <option value="Full Time">Full Time</option>
              <option value="Internship">Internship</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className={`w-full py-3 rounded text-white ${isSaving ? 'bg-gray-400' : 'bg-amber-600 hover:bg-amber-700'}`}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </form>
      </div>
    </div>
  );
};

const ManageCareers = () => {
  const [openings, setOpenings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingOpening, setEditingOpening] = useState(null);

  const handleEdit = (opening)=>{ setEditingOpening(opening); setShowAddModal(true); };
  const [saving, setSaving] = useState(false);

  const fetchOpenings = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/careers`);
      if (!res.ok) throw new Error('Failed to fetch openings');
      const data = await res.json();
      setOpenings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpenings();
  }, []);

  const handleDelete = async (id) => {
    if(!window.confirm('Delete this opening?')) return;
    try{
      const res=await fetch(`${API_BASE}/careers/${id}`,{method:'DELETE'});
      if(!res.ok) throw new Error('Delete failed');
      await fetchOpenings();
    }catch(err){alert(err.message);}  
  };

  const handleToggle = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/careers/${id}/toggle`, { method: 'PUT' });
      if (!res.ok) throw new Error('Toggle failed');
      const updated = await res.json();
      setOpenings((prev) => prev.map((o) => (o._id === id ? updated : o)));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSave = async (formData, id=null) => {
    try {
      setSaving(true);
      const url = id ? `${API_BASE}/careers/${id}` : `${API_BASE}/careers`;
      const method = id ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Failed to save');
      await fetchOpenings();
      setShowAddModal(false);
      setEditingOpening(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <Loader2 className="w-12 h-12 animate-spin" />
    </div>
  );
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4 sm:p-8 mt-10">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Manage Job Openings</h1>
        <button
          onClick={() => { setEditingOpening(null); setShowAddModal(true); }}
          className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700"
        >
          <PlusCircle className="w-5 h-5" /> Add Opening
        </button>
      </div>

      {showAddModal && (
        <AddOpeningModal
          onClose={() => setShowAddModal(false)}
          opening={editingOpening}
          onSave={handleSave}
          isSaving={saving}
        />
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 hidden md:table">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Open?</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {openings.map((o) => (
              <tr key={o._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{o.position}</div>
                  <div className="text-sm text-gray-500 truncate max-w-xs">{o.shortDescription}</div>
                </td>
                <td className="px-6 py-4">{o.location || '-'}</td>
                <td className="px-6 py-4">{o.employmentType}</td>
                <td className="px-6 py-4">
                  {o.isOpen ? (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Open</span>
                  ) : (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-600">Closed</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleEdit(o)} className="text-blue-600 hover:text-blue-900 mr-2" title="Edit"><Edit className="w-5 h-5"/></button>
                  <button onClick={() => handleDelete(o._id)} className="text-red-600 hover:text-red-900 mr-2" title="Delete"><Trash2 className="w-5 h-5"/></button>
                  <button onClick={() => handleToggle(o._id)} className="text-amber-600 hover:text-amber-900" title="Toggle Open/Closed">{o.isOpen ? <ToggleRight className="w-6 h-6"/> : <ToggleLeft className="w-6 h-6"/>}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="divide-y divide-gray-200 md:hidden">
          {openings.map((o) => (
            <div key={o._id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-lg">{o.position}</div>
                  <p className="text-sm text-gray-600 mt-1">{o.shortDescription}</p>
                </div>
                <button
                  onClick={() => handleToggle(o._id)}
                  className="text-amber-600 hover:text-amber-900 flex-shrink-0 ml-4 p-1"
                  title="Toggle Open/Closed"
                >
                  {o.isOpen ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                </button>
              </div>
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 items-center text-sm">
                <span className="font-medium">Status:</span>
                {o.isOpen ? (
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Open</span>
                ) : (
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-600">Closed</span>
                )}
                <span className="text-gray-500">|</span>
                <span className="font-medium">Type:</span>
                <span>{o.employmentType}</span>
                <span className="text-gray-500">|</span>
                <span className="font-medium">Location:</span>
                <span>{o.location || '-'}</span>
                <button onClick={() => handleEdit(o)} className="text-blue-600 hover:text-blue-900 ml-auto" title="Edit"><Edit className="w-5 h-5"/></button>
                <button onClick={() => handleDelete(o._id)} className="text-red-600 hover:text-red-900 ml-2" title="Delete"><Trash2 className="w-5 h-5"/></button>
                <button onClick={() => handleToggle(o._id)} className="text-amber-600 hover:text-amber-900 ml-2" title="Toggle Open/Closed">{o.isOpen ? <ToggleRight className="w-6 h-6"/> : <ToggleLeft className="w-6 h-6"/>}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageCareers;
