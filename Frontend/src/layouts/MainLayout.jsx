import { useState } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const { dbUser: user } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem('user');
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <nav className="bg-white text-gray-800 p-4 shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-extrabold tracking-tight text-green-700 hover:text-green-800 transition-colors flex items-center gap-2">
          <span className="text-3xl">🌾</span> AgroConnect
        </Link>
        <div className="space-x-2 md:space-x-4 flex items-center">
          {user ? (
            <>
              <Link to={user.role === 'FARMER' ? '/farmer-dashboard' : user.role === 'BUYER' ? '/buyer-dashboard' : '/admin-dashboard'} className="hover:text-green-600 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-green-50">Dashboard</Link>
              <Link to="/orders" className="hover:text-green-600 font-medium flex items-center gap-1 transition-colors px-3 py-2 rounded-lg hover:bg-green-50">
                <span>📦</span> Orders
              </Link>
              <Link to="/messages" className="hover:text-green-600 font-medium flex items-center gap-1 transition-colors px-3 py-2 rounded-lg hover:bg-green-50">
                <span>🗨️</span> Messages
              </Link>
              <div className="relative ml-2">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 font-medium hover:bg-gray-50 p-1.5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 border border-transparent hover:border-gray-200"
                >
                  <div className="bg-gradient-to-tr from-green-600 to-green-400 text-white rounded-full w-9 h-9 flex items-center justify-center font-bold shadow-sm text-sm">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] overflow-hidden z-50 text-gray-700 border border-gray-100 transform origin-top-right transition-all">
                    <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/50">
                      <p className="text-sm font-bold text-gray-900 truncate">{user?.name || 'User'}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{user?.phone || 'No phone'}</p>
                      <span className="inline-block mt-2 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-full tracking-wider">{user?.role}</span>
                    </div>
                    <div className="py-2">
                      <Link 
                        to="/profile" 
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2 px-5 py-2.5 text-sm hover:bg-gray-50 transition-colors font-medium text-gray-600 hover:text-green-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        Update Profile
                      </Link>
                      <button 
                        onClick={() => {
                          setIsDropdownOpen(false);
                          handleLogout();
                        }} 
                        className="flex items-center gap-2 w-full text-left px-5 py-2.5 text-sm text-red-600 font-bold hover:bg-red-50 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-green-600 font-semibold px-4 py-2 transition-colors">Login</Link>
              <Link to="/register" className="bg-green-600 text-white px-5 py-2.5 rounded-full font-bold hover:bg-green-700 hover:shadow-md transition-all active:scale-95">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-gray-900 selection:bg-green-200 selection:text-green-900">
      <Navigation />
      <main className="flex-grow flex flex-col">
        <Outlet />
      </main>
      <footer className="bg-white border-t border-gray-100 text-gray-500 text-center py-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-2xl">🌾</span>
            <span className="text-lg font-bold text-gray-800">AgroConnect</span>
          </div>
          <p className="text-sm">© 2026 AgroConnect. Connecting Farmers and Buyers directly.</p>
        </div>
      </footer>
    </div>
  );
}
