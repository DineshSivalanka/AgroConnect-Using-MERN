import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { request } from '../api';
import { Card, CardBody } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

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
    <div className="flex justify-center items-center flex-grow py-12 px-4 animate-fadeIn">
      <div className="w-full max-w-md relative">
        {/* Decorative background elements */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-green-200 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-amber-200 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-2000"></div>
        
        <Card className="relative z-10 backdrop-blur-sm bg-white/90 shadow-2xl border-white border-2">
          <CardBody className="p-8">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 text-white rounded-full text-3xl font-black mb-4 shadow-lg border-4 border-white">
                {name ? name.charAt(0).toUpperCase() : '👤'}
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Profile</h2>
              <p className="text-gray-500 font-medium mt-1">Manage your account details</p>
            </div>

            {error && (
              <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl mb-6 text-sm font-medium border border-rose-100 flex items-start gap-2">
                <span className="mt-0.5">⚠️</span>
                <span>{error}</span>
              </div>
            )}
            
            {success && (
              <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl mb-6 text-sm font-medium border border-emerald-100 flex items-start gap-2">
                <span className="mt-0.5">✅</span>
                <span>{success}</span>
              </div>
            )}
            
            <form onSubmit={handleUpdate} className="space-y-6">
              <div>
                <Input 
                  label="Role"
                  type="text" 
                  value={role}
                  disabled
                  icon="👤"
                />
                <p className="text-xs text-gray-400 mt-2 font-medium flex items-center gap-1">
                  <span className="opacity-70">ℹ️</span> Role cannot be changed.
                </p>
              </div>
              
              <Input 
                label="Full Name"
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                icon="📝"
              />
              
              <Input 
                label="Phone Number"
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                icon="📱"
              />
              
              <Input 
                label="Location"
                type="text" 
                value={locationStr}
                onChange={(e) => setLocationStr(e.target.value)}
                required
                icon="📍"
                placeholder="City, State"
              />
              
              <div className="pt-4">
                <Button 
                  type="submit" 
                  isLoading={loading}
                  className="w-full py-4 text-lg"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
