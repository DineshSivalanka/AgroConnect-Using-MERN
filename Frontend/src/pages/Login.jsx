import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { request } from '../api';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('FARMER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await request('/users/login', {
        method: 'POST',
        body: JSON.stringify({ phone, role }),
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
      setError('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center flex-grow py-12">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-8">Welcome Back</h2>
        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-center font-medium border border-red-100">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-6">
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
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-green-600 text-white rounded-xl p-4 font-bold hover:bg-green-700 transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'LOGIN'}
          </button>
        </form>
        <p className="mt-8 text-center text-gray-600">
          Don't have an account? <Link to="/register" className="text-green-600 font-bold hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}
