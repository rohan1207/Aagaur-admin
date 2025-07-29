import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TeamMemberForm from '../components/TeamMemberForm';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_URL;

const ManageTeam = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [personType, setPersonType] = useState('member');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('adminToken');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      const [membersRes, internsRes] = await Promise.all([
        axios.get(`${API_URL}/team/members`, config),
        axios.get(`${API_URL}/team/interns`, config)
      ]);
      setTeamMembers(membersRes.data);
      setInterns(internsRes.data);
    } catch (err) {
      setError('Failed to fetch team data. Please refresh.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (type) => {
    setEditingPerson(null);
    setPersonType(type);
    setIsModalOpen(true);
  };

  const handleEdit = (person, type) => {
    setEditingPerson(person);
    setPersonType(type);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSubmitting) return; // Prevent closing while submitting
    setIsModalOpen(false);
    setEditingPerson(null);
  };

  const handleSubmit = async (formData, id) => {
    setIsSubmitting(true);
    const token = localStorage.getItem('adminToken');
    const config = { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } };
    const url = id ? `${API_URL}/team/${personType}s/${id}` : `${API_URL}/team/${personType}s`;
    const method = id ? 'put' : 'post';

    try {
      await axios[method](url, formData, config);
      fetchData();
      handleCloseModal();
    } catch (err) {
      console.error(`Failed to ${id ? 'update' : 'create'} person`, err);
      setError(`Failed to ${id ? 'update' : 'create'} person. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, type) => {
    if (window.confirm('Are you sure you want to delete this person?')) {
      try {
        const token = localStorage.getItem('adminToken');
        const config = { headers: { 'Authorization': `Bearer ${token}` } };
        await axios.delete(`${API_URL}/team/${type}s/${id}`, config);
        fetchData();
      } catch (err) {
        setError(`Failed to delete person. Please try again.`);
        console.error(err);
      }
    }
  };

  const renderPersonCard = (person, type) => (
    <div key={person._id} className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
      <img src={person.image} alt={person.name} className="w-full h-56 object-cover" />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 truncate">{person.name}</h3>
        <p className="text-sm text-gray-500 mb-3">{person.role}</p>
        <div className="flex justify-end gap-2">
          <button onClick={() => handleEdit(person, type)} className="p-2 rounded-full text-gray-600 hover:bg-gray-200 hover:text-gray-800 transition-colors">
            <FiEdit />
          </button>
          <button onClick={() => handleDelete(person._id, type)} className="p-2 rounded-full text-red-500 hover:bg-red-100 transition-colors">
            <FiTrash2 />
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) return <div className="flex justify-center items-center h-screen"><div className="text-xl font-semibold text-gray-700">Loading Team...</div></div>;
  if (error) return <div className="p-6 text-center text-red-500 bg-red-50 rounded-lg">{error}</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen mt-10">
      <div className="max-w-7xl mx-auto">
        {/* Team Members Section */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2 sm:mb-0">Team Members</h2>
            <button onClick={() => handleAdd('member')} className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-gray-700 transition-colors">
              <FiPlus /> Add Member
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {teamMembers.map(member => renderPersonCard(member, 'member'))}
          </div>
        </div>

        {/* Interns Section */}
        <div>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2 sm:mb-0">Sessional Interns</h2>
            <button onClick={() => handleAdd('intern')} className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-gray-700 transition-colors">
              <FiPlus /> Add Intern
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {interns.map(intern => renderPersonCard(intern, 'intern'))}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg transform transition-all" onClick={(e) => e.stopPropagation()}>
            <TeamMemberForm
              person={editingPerson}
              type={personType}
              onSubmit={handleSubmit}
              onClose={handleCloseModal}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTeam;
