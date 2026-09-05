import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { request } from '../api';
import { Card, CardBody } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { User, AlertCircle, CheckCircle2, Info, Camera } from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

export default function Profile() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [locationStr, setLocationStr] = useState('');
  const [role, setRole] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  const { dbUser: user, setDbUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setName(user.name || '');
    setPhone(user.phone || '');
    setLocationStr(user.location || '');
    setRole(user.role || '');
    setAvatarUrl(user.avatarUrl || '');
  }, [user, navigate]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const storageRef = ref(storage, `avatars/${user.id}_${Date.now()}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          setError('Failed to upload image: ' + error.message);
          setIsUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setAvatarUrl(downloadURL);
          setIsUploading(false);
          setUploadProgress(0);
          setSuccess('Image uploaded! Click Save Changes to update your profile.');
        }
      );
    } catch (err) {
      setError('Failed to start upload: ' + err.message);
      setIsUploading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const updatedUser = await request(`/users/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify({ name, phone, location: locationStr, avatarUrl }),
      });
      
      setDbUser(updatedUser);
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
              <div 
                className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 text-white rounded-full mb-6 shadow-lg border-4 border-white group cursor-pointer overflow-hidden"
                onClick={() => fileInputRef.current?.click()}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  name ? <span className="text-4xl font-black">{name.charAt(0).toUpperCase()}</span> : <User className="w-12 h-12" />
                )}
                
                {/* Hover overlay for upload */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-8 h-8 text-white drop-shadow-md" />
                </div>
                
                {/* Upload progress bar */}
                {isUploading && (
                  <div className="absolute bottom-0 left-0 h-1.5 bg-green-500 transition-all duration-300 z-10" style={{ width: `${uploadProgress}%` }}></div>
                )}
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Profile</h2>
              <p className="text-gray-500 font-medium mt-1">Manage your account details</p>
            </div>

            {error && (
              <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl mb-6 text-sm font-medium border border-rose-100 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            {success && (
              <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl mb-6 text-sm font-medium border border-emerald-100 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
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
                />
                <p className="text-xs text-gray-400 mt-2 font-medium flex items-center gap-1">
                  <Info className="w-3 h-3 opacity-70" /> Role cannot be changed.
                </p>
              </div>
              
              <Input 
                label="Full Name"
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              
              <Input 
                label="Phone Number"
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              
              <Input 
                label="Location"
                type="text" 
                value={locationStr}
                onChange={(e) => setLocationStr(e.target.value)}
                required
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
