import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import FarmerDashboard from './pages/FarmerDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import Messages from './pages/Messages';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import { useState } from 'react';

function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="bg-green-600 text-white p-4 shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold tracking-tight hover:text-green-200 transition-colors">
          🌾 AgroConnect
        </Link>
        <div className="space-x-4 flex items-center">
          {user ? (
            <>
              <Link to={user.role === 'FARMER' ? '/farmer-dashboard' : user.role === 'BUYER' ? '/buyer-dashboard' : '/admin-dashboard'} className="hover:underline font-medium">Dashboard</Link>
              <Link to="/orders" className="hover:underline font-medium flex items-center gap-1">
                <span>📦</span> Orders
              </Link>
              <Link to="/messages" className="hover:underline font-medium flex items-center gap-1">
                <span>🗨️</span> Messages
              </Link>
              <div className="relative">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 font-medium hover:text-green-200 transition-colors focus:outline-none ml-2"
                >
                  <div className="bg-white text-green-600 rounded-full w-8 h-8 flex items-center justify-center font-bold shadow-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-lg">{user.name}</span>
                  <span className="text-xs">▼</span>
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl overflow-hidden z-50 text-gray-700 border border-gray-100">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-bold truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.phone}</p>
                    </div>
                    <div className="py-1">
                      <Link 
                        to="/profile" 
                        onClick={() => setIsDropdownOpen(false)}
                        className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                      >
                        Update Profile
                      </Link>
                      <button 
                        onClick={() => {
                          setIsDropdownOpen(false);
                          handleLogout();
                        }} 
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 font-bold hover:bg-gray-50 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:underline font-medium">Login</Link>
              <Link to="/register" className="bg-white text-green-600 px-4 py-2 rounded-full font-semibold hover:bg-green-100 transition-colors shadow-sm">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navigation />
        
        <main className="flex-grow container mx-auto p-4 flex flex-col">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
            <Route path="/buyer-dashboard" element={<BuyerDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
        
        <footer className="bg-gray-800 text-white text-center p-6 mt-auto">
          <p className="text-gray-400">© 2026 AgroConnect. Connecting Farmers and Buyers.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
