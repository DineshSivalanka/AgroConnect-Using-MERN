import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { request } from '../api';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const loggedUser = JSON.parse(localStorage.getItem('user'));
    if (!loggedUser || loggedUser.role !== 'ADMIN') {
      navigate('/login');
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const [statsData, usersData] = await Promise.all([
        request('/admin/stats'),
        request('/admin/users')
      ]);
      setStats(statsData);
      setUsers(usersData || []);
    } catch (e) {
      console.error(e);
      alert('Failed to fetch admin data');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user? This will also delete their listings and messages!")) return;
    try {
      await request(`/admin/users/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (e) {
      console.error(e);
      alert('Failed to delete user. There might be related records (listings, messages) that prevent deletion unless cascade delete is configured.');
    }
  };

  if (!stats) return <div className="text-center py-20 text-xl font-bold text-gray-500">Loading Dashboard...</div>;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 w-full">
      <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-8">Admin Dashboard</h2>

      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => setActiveTab('overview')} 
          className={`px-6 py-2 font-bold rounded-full transition-colors ${activeTab === 'overview' ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`}
        >
          Overview
        </button>
        <button 
          onClick={() => setActiveTab('users')} 
          className={`px-6 py-2 font-bold rounded-full transition-colors ${activeTab === 'users' ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`}
        >
          Manage Users
        </button>
        <button 
          onClick={() => setActiveTab('analytics')} 
          className={`px-6 py-2 font-bold rounded-full transition-colors ${activeTab === 'analytics' ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`}
        >
          Analytics & Reports
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard title="Total Users" value={stats.totalUsers} icon="👥" color="bg-blue-50 text-blue-700" />
          <StatCard title="Total Farmers" value={stats.totalFarmers} icon="🚜" color="bg-green-50 text-green-700" />
          <StatCard title="Total Buyers" value={stats.totalBuyers} icon="🛒" color="bg-purple-50 text-purple-700" />
          <StatCard title="Active Listings" value={stats.totalListings} icon="📦" color="bg-yellow-50 text-yellow-700" />
          <StatCard title="Purchase Requests" value={stats.totalRequests} icon="🤝" color="bg-orange-50 text-orange-700" />
          <StatCard title="Messages Sent" value={stats.totalMessages} icon="💬" color="bg-teal-50 text-teal-700" />
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-700 border-b border-gray-200">
                <th className="p-4 font-bold">ID</th>
                <th className="p-4 font-bold">Name</th>
                <th className="p-4 font-bold">Role</th>
                <th className="p-4 font-bold">Phone</th>
                <th className="p-4 font-bold">Location</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-gray-500">#{u.id}</td>
                  <td className="p-4 font-bold text-gray-800">{u.name}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'ADMIN' ? 'bg-red-100 text-red-700' : u.role === 'FARMER' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">{u.phone}</td>
                  <td className="p-4 text-gray-600">{u.location}</td>
                  <td className="p-4 text-right">
                    {u.role !== 'ADMIN' && (
                      <button 
                        onClick={() => handleDeleteUser(u.id)}
                        className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors border border-red-200"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Orders by Status Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Order Status Distribution</h3>
              <div className="h-80 w-full">
                {stats.ordersByStatus && stats.ordersByStatus.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.ordersByStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {stats.ordersByStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">No order data available</div>
                )}
              </div>
            </div>

            {/* Products by Category Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Active Products by Category</h3>
              <div className="h-80 w-full">
                {stats.productsByCategory && stats.productsByCategory.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.productsByCategory} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <RechartsTooltip cursor={{ fill: '#f3f4f6' }} />
                      <Bar dataKey="value" name="Total Listings" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">No product data available</div>
                )}
              </div>
            </div>
          </div>

          {/* Top Farmers Leaderboard */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-6">🏆 Top Rated Farmers</h3>
            {stats.topFarmers && stats.topFarmers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.topFarmers.map((farmer, idx) => (
                  <div key={farmer._id || farmer.id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow bg-gray-50">
                    <div className="w-12 h-12 bg-yellow-100 text-yellow-700 rounded-full flex items-center justify-center text-xl font-black shrink-0">
                      #{idx + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{farmer.name}</h4>
                      <div className="flex items-center gap-1 text-sm mt-1">
                        <span className="text-yellow-500">⭐ {farmer.averageRating}</span>
                        <span className="text-gray-500">({farmer.reviewCount} reviews)</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">📍 {farmer.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No rated farmers yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className={`p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between ${color}`}>
      <div>
        <p className="text-sm font-bold uppercase tracking-wider opacity-80">{title}</p>
        <p className="text-4xl font-extrabold mt-2">{value}</p>
      </div>
      <div className="text-5xl opacity-80">{icon}</div>
    </div>
  );
}
