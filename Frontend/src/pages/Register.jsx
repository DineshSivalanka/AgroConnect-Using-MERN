import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { request } from '../api';

export default function Register() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('FARMER');
  const [locationStr, setLocationStr] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const roleParam = searchParams.get('role');
    if (roleParam && (roleParam === 'FARMER' || roleParam === 'BUYER')) {
      setRole(roleParam);
    }
  }, [location]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await request('/users/register', {
        method: 'POST',
        body: JSON.stringify({ name, phone, role, location: locationStr }),
      });
      
      localStorage.setItem('user', JSON.stringify(user));
      
      if (user.role === 'FARMER') {
        navigate('/farmer-dashboard');
      } else if (user.role === 'BUYER') {
        navigate('/buyer-dashboard');
      } else {
        navigate('/admin-dashboard');
      }
    } catch (err) {
      setError('Registration failed. ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center flex-grow py-12">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-8">Create an Account</h2>
        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-center font-medium border border-red-100">{error}</div>}
        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-green-500 focus:outline-none transition-all"
              placeholder="e.g. Ramesh"
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
              placeholder="e.g. 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Role</label>
            <select 
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-green-500 focus:outline-none transition-all bg-white"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="FARMER">Farmer</option>
              <option value="BUYER">Buyer</option>
              <option value="ADMIN">Admin (Test)</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Location</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-green-500 focus:outline-none transition-all"
              placeholder="e.g. Bhimavaram"
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
            {loading ? 'Registering...' : 'REGISTER'}
          </button>
        </form>
        <p className="mt-8 text-center text-gray-600">
          Already have an account? <Link to="/login" className="text-green-600 font-bold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
