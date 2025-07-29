import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

const TeamMemberForm = ({ person, type, onSubmit, onClose, isSubmitting }) => {
  const getInitialState = () => {
    if (person) return { ...person };
    return type === 'member' 
      ? { name: '', role: '', specialty: '', bio: '' } 
      : { name: '', role: '', bio: '' };
  };

  const [formData, setFormData] = useState(getInitialState);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(person?.image || '');

  useEffect(() => {
    setFormData(getInitialState());
    setImagePreview(person?.image || '');
    setImageFile(null);
  }, [person, type]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key !== '_id' && key !== 'image' && key !== 'createdAt' && key !== 'updatedAt' && key !== '__v') {
        data.append(key, formData[key]);
      }
    });
    if (imageFile) {
      data.append('image', imageFile);
    }
    onSubmit(data, person?._id);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">{person ? 'Edit' : 'Add'} {type === 'member' ? 'Team Member' : 'Intern'}</h2>
        <button type="button" onClick={onClose} disabled={isSubmitting} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 disabled:opacity-50">
          <FiX size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input type="text" name="name" value={formData.name || ''} onChange={handleChange} placeholder="Name" required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent transition" />
        <input type="text" name="role" value={formData.role || ''} onChange={handleChange} placeholder="Role (e.g., Founder)" required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent transition" />
      </div>

      {type === 'member' && (
        <input type="text" name="specialty" value={formData.specialty || ''} onChange={handleChange} placeholder="Specialty (e.g., Architecture)" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent transition" />
      )}

      <textarea name="bio" value={formData.bio || ''} onChange={handleChange} placeholder="Short Bio" rows="4" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent transition"></textarea>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
        <input type="file" onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" accept="image/*" />
        {imagePreview && <img src={imagePreview} alt="Preview" className="mt-4 h-40 w-auto object-cover rounded-lg shadow-sm" />}
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <button type="button" onClick={onClose} disabled={isSubmitting} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 disabled:opacity-50 transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-gray-800 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
          {isSubmitting ? 'Saving...' : (person ? 'Save Changes' : 'Add Member')}
        </button>
      </div>
    </form>
  );
};

export default TeamMemberForm;
