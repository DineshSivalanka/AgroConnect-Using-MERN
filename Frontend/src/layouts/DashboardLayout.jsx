import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout() {
  const { currentUser } = useAuth();
  const user = JSON.parse(localStorage.getItem('user'));
  
  const role = user?.role || 'FARMER';
  
  const navItems = [
    { name: 'Overview', path: `/${role.toLowerCase()}-dashboard`, icon: '📊' },
    { name: 'My Orders', path: '/orders', icon: '📦' },
    { name: 'Messages', path: '/messages', icon: '🗨️' },
    { name: 'Profile', path: '/profile', icon: '👤' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8 flex-grow">
      {/* Sidebar */}
      <aside className="w-full md:w-64 flex-shrink-0">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-24">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-gradient-to-br from-green-500 to-emerald-700 w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="font-bold text-gray-900 truncate w-32">{user?.name || 'User'}</h2>
              <p className="text-xs font-semibold text-green-600 bg-green-50 inline-block px-2 py-0.5 rounded-full mt-1">{role}</p>
            </div>
          </div>
          
          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-green-600 text-white shadow-md' 
                      : 'text-gray-600 hover:bg-green-50 hover:text-green-700'
                  }`
                }
              >
                <span className="text-xl">{item.icon}</span>
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
