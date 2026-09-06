import { useState } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const { dbUser: user } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNavDropdownOpen, setIsNavDropdownOpen] = useState(false);

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
    <nav className="bg-green-600 text-white p-4 shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          {user && (
            <div className="relative">
              <button
                onClick={() => setIsNavDropdownOpen(!isNavDropdownOpen)}
                className="md:hidden p-2 rounded-full hover:bg-green-700 transition-colors text-white focus:outline-none focus:ring-2 focus:ring-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
              </button>

              {isNavDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 bg-black/50 z-[90] animate-fadeIn"
                    onClick={() => setIsNavDropdownOpen(false)}
                  ></div>
                  <div className="fixed top-0 left-0 bottom-0 w-64 bg-white z-[100] flex flex-col items-start justify-start pt-20 px-6 shadow-2xl transform transition-transform">
                    <button 
                      onClick={() => setIsNavDropdownOpen(false)}
                      className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-900 focus:outline-none"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                    
                    <div className="flex flex-col items-start w-full mt-4">
                      <Link 
                        to={user.role === 'FARMER' ? '/farmer-dashboard' : user.role === 'BUYER' ? '/buyer-dashboard' : '/admin-dashboard'} 
                        onClick={() => setIsNavDropdownOpen(false)}
                        className="w-full text-left py-4 px-3 text-lg font-bold text-gray-700 hover:text-green-600 hover:bg-green-50 transition-colors border-b border-gray-100 rounded-t-xl"
                      >
                        Dashboard
                      </Link>
                      <Link 
                        to="/orders" 
                        onClick={() => setIsNavDropdownOpen(false)}
                        className="w-full text-left py-4 px-3 text-lg font-bold text-gray-700 hover:text-green-600 hover:bg-green-50 transition-colors border-b border-gray-100 flex items-center justify-start gap-3"
                      >
                        <span className="text-xl">📦</span> Orders
                      </Link>
                      <Link 
                        to="/messages" 
                        onClick={() => setIsNavDropdownOpen(false)}
                        className="w-full text-left py-4 px-3 text-lg font-bold text-gray-700 hover:text-green-600 hover:bg-green-50 transition-colors flex items-center justify-start gap-3 rounded-b-xl"
                      >
                        <span className="text-xl">🗨️</span> Messages
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          <Link to="/" className="text-2xl font-extrabold tracking-tight text-white hover:text-green-100 transition-colors flex items-center gap-2 md:ml-4">
            <span className="text-3xl">🌾</span> AgroConnect
          </Link>
        </div>
        <div className="space-x-2 md:space-x-4 flex items-center">
          {user && (
            <div className="hidden md:flex items-center gap-8 mr-2 md:mr-6">
              <Link to={user.role === 'FARMER' ? '/farmer-dashboard' : user.role === 'BUYER' ? '/buyer-dashboard' : '/admin-dashboard'} className="text-white hover:text-green-200 font-semibold transition-all active:scale-95 text-base md:text-lg">Dashboard</Link>
              <Link to="/orders" className="text-white hover:text-green-200 font-semibold transition-all active:scale-95 flex items-center gap-2 text-base md:text-lg"><span>📦</span> Orders</Link>
              <Link to="/messages" className="text-white hover:text-green-200 font-semibold transition-all active:scale-95 flex items-center gap-2 text-base md:text-lg"><span>🗨️</span> Messages</Link>
            </div>
          )}
          {user ? (
            <>
              <div className="relative ml-2">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 font-medium hover:bg-green-700 p-1.5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white border border-transparent"
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
              <Link to="/login" className="hover:text-green-200 text-white font-semibold px-4 py-2 transition-colors">Login</Link>
              <Link to="/register" className="bg-white text-green-700 px-5 py-2.5 rounded-full font-bold hover:bg-green-50 hover:shadow-md transition-all active:scale-95">
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
      <footer className="bg-white border-t border-gray-100 text-gray-500 text-center py-4 mt-auto">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl">🌾</span>
            <span className="text-base font-bold text-gray-800">AgroConnect</span>
          </div>
          <p className="text-sm">© 2026 AgroConnect. Connecting Farmers and Buyers directly.</p>
        </div>
      </footer>
    </div>
  );
}
