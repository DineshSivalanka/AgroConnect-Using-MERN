import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Home, List, MessageSquare, Package, Settings, LogOut, Search, Map, CheckSquare, Bell, User as UserIcon, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout() {
  const { currentUser, dbUser: user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const role = user?.role || 'FARMER';
  
  const navItems = [
    { name: 'Overview', path: `/${role.toLowerCase()}-dashboard`, icon: <Home className="w-5 h-5" /> },
    { name: 'My Orders', path: '/orders', icon: <Package className="w-5 h-5" /> },
    { name: 'Messages', path: '/messages', icon: <MessageSquare className="w-5 h-5" /> },
    { name: 'Profile', path: '/profile', icon: <UserIcon className="w-5 h-5" /> },
  ];

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 flex flex-col md:flex-row gap-8 flex-grow relative">
      {/* Mobile Menu Button */}
      <div className="md:hidden flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-green-500 to-emerald-700 w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-md overflow-hidden shrink-0">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user?.name} className="w-full h-full object-cover" />
            ) : (
              user?.name?.charAt(0).toUpperCase() || 'U'
            )}
          </div>
          <div>
            <h2 className="font-bold text-gray-900 truncate w-32">{user?.name || 'User'}</h2>
            <p className="text-[10px] font-semibold text-green-600 uppercase tracking-wider">{role}</p>
          </div>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 md:top-24 left-0 h-full md:h-auto w-72 md:w-64 bg-white md:bg-transparent z-50 md:z-0 shadow-2xl md:shadow-none transition-transform duration-300 ease-in-out flex-shrink-0 flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="bg-white md:rounded-3xl p-6 md:shadow-sm md:border border-gray-100 h-full overflow-y-auto">
          <div className="flex items-center justify-between mb-8 md:hidden">
            <h2 className="text-xl font-bold text-gray-900">Menu</h2>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 bg-gray-50 text-gray-500 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="hidden md:flex items-center gap-4 mb-8">
            <div className="bg-gradient-to-br from-green-500 to-emerald-700 w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg overflow-hidden shrink-0">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user?.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0).toUpperCase() || 'U'
              )}
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
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-green-600 text-white shadow-md' 
                      : 'text-gray-600 hover:bg-green-50 hover:text-green-700'
                  }`
                }
              >
                <span>{item.icon}</span>
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
