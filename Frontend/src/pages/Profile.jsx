import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { request } from '../api';

export default function Profile() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [locationStr, setLocationStr] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      navigate('/login');
      return;
    }
    setName(user.name);
    setPhone(user.phone);
    setLocationStr(user.location);
    setRole(user.role);
  }, [navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const updatedUser = await request(`/users/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify({ name, phone, location: locationStr }),
      });
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError('Failed to update profile. ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center flex-grow py-12">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-8">My Profile</h2>
        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-center font-medium border border-red-100">{error}</div>}
        {success && <div className="bg-green-50 text-green-600 p-4 rounded-xl mb-6 text-center font-medium border border-green-100">{success}</div>}
        
        <form onSubmit={handleUpdate} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Role</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-xl p-3 bg-gray-100 cursor-not-allowed text-gray-500"
              value={role}
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">Role cannot be changed.</p>
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-green-500 focus:outline-none transition-all"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Phone Number</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-green-500 focus:outline-none transition-all"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Location</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-green-500 focus:outline-none transition-all"
              value={locationStr}
              onChange={(e) => setLocationStr(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-green-600 text-white rounded-xl p-4 font-bold hover:bg-green-700 transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'UPDATE PROFILE'}
          </button>
        </form>
      </div>
    </div>
  );
}
