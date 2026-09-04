import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { request } from '../api';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

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

  if (!stats) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
      <div className="text-xl font-bold text-gray-500">Loading Dashboard...</div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Admin Dashboard <span className="text-2xl">⚡</span></h2>
          <p className="text-gray-500 mt-1 font-medium">Platform overview and user management</p>
        </div>
        
        <div className="flex bg-gray-100 p-1.5 rounded-2xl w-full sm:w-auto overflow-x-auto custom-scrollbar">
          <button 
            onClick={() => setActiveTab('overview')} 
            className={`px-6 py-2.5 font-bold rounded-xl transition-all whitespace-nowrap ${activeTab === 'overview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('users')} 
            className={`px-6 py-2.5 font-bold rounded-xl transition-all whitespace-nowrap ${activeTab === 'users' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Users
          </button>
          <button 
            onClick={() => setActiveTab('analytics')} 
            className={`px-6 py-2.5 font-bold rounded-xl transition-all whitespace-nowrap ${activeTab === 'analytics' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Analytics
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fadeIn">
          <StatCard title="Total Users" value={stats.totalUsers} icon="👥" color="from-blue-50 to-blue-100/50" textColor="text-blue-700" borderColor="border-blue-100" />
          <StatCard title="Total Farmers" value={stats.totalFarmers} icon="🚜" color="from-emerald-50 to-emerald-100/50" textColor="text-emerald-700" borderColor="border-emerald-100" />
          <StatCard title="Total Buyers" value={stats.totalBuyers} icon="🛒" color="from-purple-50 to-purple-100/50" textColor="text-purple-700" borderColor="border-purple-100" />
          <StatCard title="Active Listings" value={stats.totalListings} icon="📦" color="from-amber-50 to-amber-100/50" textColor="text-amber-700" borderColor="border-amber-100" />
          <StatCard title="Purchase Requests" value={stats.totalRequests} icon="🤝" color="from-rose-50 to-rose-100/50" textColor="text-rose-700" borderColor="border-rose-100" />
          <StatCard title="Messages Sent" value={stats.totalMessages} icon="💬" color="from-cyan-50 to-cyan-100/50" textColor="text-cyan-700" borderColor="border-cyan-100" />
        </div>
      )}

      {activeTab === 'users' && (
        <Card className="animate-fadeIn overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 text-gray-700 border-b border-gray-100">
                  <th className="p-5 font-bold text-sm tracking-wider uppercase">User</th>
                  <th className="p-5 font-bold text-sm tracking-wider uppercase">Role</th>
                  <th className="p-5 font-bold text-sm tracking-wider uppercase">Contact</th>
                  <th className="p-5 font-bold text-sm tracking-wider uppercase">Location</th>
                  <th className="p-5 font-bold text-sm tracking-wider uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-5">
                      <div>
                        <p className="font-bold text-gray-900">{u.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">ID: {u.id}</p>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider ${u.role === 'ADMIN' ? 'bg-rose-100 text-rose-700' : u.role === 'FARMER' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-5 text-gray-600 font-medium">{u.phone}</td>
                    <td className="p-5 text-gray-600 flex items-center gap-1.5"><span className="opacity-50">📍</span> {u.location}</td>
                    <td className="p-5 text-right">
                      {u.role !== 'ADMIN' && (
                        <Button 
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteUser(u.id)}
                        >
                          Remove
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-12 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                        <span className="text-2xl">👥</span>
                      </div>
                      <p className="text-gray-500 font-medium">No users found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Orders by Status Chart */}
            <Card>
              <CardBody>
                <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                  <span className="p-2 bg-blue-50 rounded-lg text-blue-600">📊</span> Order Status Distribution
                </h3>
                <div className="h-80 w-full">
                  {stats.ordersByStatus && stats.ordersByStatus.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.ordersByStatus}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={110}
                          fill="#8884d8"
                          paddingAngle={8}
                          dataKey="value"
                          stroke="none"
                          label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {stats.ordersByStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }} />
                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                      <span className="text-3xl mb-2">📉</span>
                      <p className="font-medium">No order data available</p>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>

            {/* Products by Category Chart */}
            <Card>
              <CardBody>
                <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                  <span className="p-2 bg-emerald-50 rounded-lg text-emerald-600">📈</span> Active Products
                </h3>
                <div className="h-80 w-full">
                  {stats.productsByCategory && stats.productsByCategory.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.productsByCategory} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontWeight: 500}} dy={10} />
                        <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontWeight: 500}} dx={-10} />
                        <RechartsTooltip cursor={{ fill: '#F3F4F6', opacity: 0.5 }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                        <Bar dataKey="value" name="Total Listings" fill="#10B981" radius={[6, 6, 0, 0]} maxBarSize={50} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                      <span className="text-3xl mb-2">📊</span>
                      <p className="font-medium">No product data available</p>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Top Farmers Leaderboard */}
          <Card>
            <CardBody>
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-2xl">🏆</span> Top Rated Farmers
              </h3>
              {stats.topFarmers && stats.topFarmers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stats.topFarmers.map((farmer, idx) => (
                    <div key={farmer._id || farmer.id} className="flex items-center gap-5 p-5 border border-gray-100 rounded-2xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-amber-200 transition-all bg-white group">
                      <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-yellow-200 text-amber-700 rounded-2xl flex items-center justify-center text-2xl font-black shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                        #{idx + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">{farmer.name}</h4>
                        <div className="flex items-center gap-1.5 text-sm mt-1">
                          <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                            <span>⭐</span> {farmer.averageRating}
                          </span>
                          <span className="text-gray-500 font-medium">({farmer.reviewCount} reviews)</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                          <span className="opacity-60">📍</span> {farmer.location}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <span className="text-4xl mb-3 block">🌟</span>
                  <p className="text-gray-500 font-medium">No rated farmers yet.</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, color, textColor, borderColor }) {
  return (
    <div className={`p-6 rounded-3xl shadow-sm border ${borderColor} flex items-center justify-between bg-gradient-to-br ${color} relative overflow-hidden group hover:shadow-md transition-shadow`}>
      <div className="relative z-10">
        <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${textColor} opacity-80`}>{title}</p>
        <p className={`text-4xl font-black ${textColor}`}>{value}</p>
      </div>
      <div className="text-5xl opacity-40 group-hover:scale-110 group-hover:opacity-60 transition-all relative z-10 filter drop-shadow-sm">{icon}</div>
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-white opacity-20 rounded-full blur-2xl"></div>
    </div>
  );
}
