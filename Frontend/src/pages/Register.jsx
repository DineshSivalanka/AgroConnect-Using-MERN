import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { request } from '../api';
import { auth } from '../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export default function Register() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1 for Form, 2 for OTP
  const [role, setRole] = useState('FARMER');
  const [locationStr, setLocationStr] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const roleParam = searchParams.get('role');
    if (roleParam && (roleParam === 'FARMER' || roleParam === 'BUYER')) {
      setRole(roleParam);
    }

    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response) => {
          // reCAPTCHA solved
        },
        'expired-callback': () => {
          setError('reCAPTCHA expired. Please try again.');
        }
      });
    }
  }, [location]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const phoneNumber = phone.startsWith('+') ? phone : `+91${phone}`;
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      setStep(2);
    } catch (err) {
      console.error(err);
      setError(`Failed to send OTP. Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpAndRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      const idToken = await result.user.getIdToken();
      
      const user = await request('/users/register', {
        method: 'POST',
        body: JSON.stringify({ idToken, name, role, location: locationStr }),
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
      console.error(err);
      setError('Invalid OTP or Registration failed. ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center flex-grow py-12 px-4">
      <Card className="w-full max-w-md">
        <CardBody>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900">Create an Account</h2>
            <p className="text-gray-500 mt-2">Join AgroConnect today</p>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-center font-medium border border-red-100">
              {error}
            </div>
          )}
          
          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <Input
                label="Full Name"
                id="name"
                type="text"
                placeholder="e.g. Ramesh"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              
              <Input
                label="Phone Number"
                id="phone"
                type="tel"
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              
              <div className="w-full">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Role</label>
                <select 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="FARMER">Farmer</option>
                  <option value="BUYER">Buyer</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              
              <Input
                label="Location"
                id="locationStr"
                type="text"
                placeholder="e.g. Bhimavaram"
                value={locationStr}
                onChange={(e) => setLocationStr(e.target.value)}
                required
              />
              
              <Button type="submit" fullWidth isLoading={loading} className="mt-4">
                REGISTER & SEND OTP
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtpAndRegister} className="space-y-5">
              <Input
                label="Enter OTP"
                id="otp"
                type="text"
                placeholder="XXXXXX"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                className="text-center tracking-widest text-lg font-bold"
              />
              
              <Button type="submit" fullWidth isLoading={loading} className="mt-4">
                VERIFY & CREATE ACCOUNT
              </Button>
              
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-green-600 font-semibold text-center hover:text-green-700 transition-colors mt-2"
              >
                Back to Details
              </button>
            </form>
          )}
          
          <p className="mt-8 text-center text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-green-600 font-bold hover:text-green-700 transition-colors">
              Login
            </Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
