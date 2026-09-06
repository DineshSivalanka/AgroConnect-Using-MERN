import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { request } from '../api';
import { auth } from '../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { Card, CardBody, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1 for Phone, 2 for OTP
  const [role, setRole] = useState('FARMER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize reCAPTCHA
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
  }, []);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Firebase requires phone numbers with country code, e.g., +91 for India
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

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      const idToken = await result.user.getIdToken();
      
      // Check for Admin (silently set role to ADMIN if phone matches)
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const actualRole = (cleanPhone === '919542643859' || cleanPhone === '9542643859') ? 'ADMIN' : role;

      // Send token to our backend for verification and login
      const user = await request('/users/login', {
        method: 'POST',
        body: JSON.stringify({ idToken, role: actualRole }),
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
      setError('Invalid OTP or Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="flex justify-center items-center flex-grow py-12 px-4 relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/login-bg.png')" }}
    >
      {/* Dark overlay to make text readable */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-0"></div>
      
      <Card className="w-full max-w-md relative z-10 shadow-2xl border-0 bg-white/95 backdrop-blur-md">
        <CardBody>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900">Welcome Back</h2>
            <p className="text-gray-500 mt-2">Log in to your AgroConnect account</p>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-center font-medium border border-red-100">
              {error}
            </div>
          )}
          
          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
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
                </select>
              </div>
              
              <Button type="submit" fullWidth isLoading={loading} className="mt-4">
                SEND OTP
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
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
                VERIFY & LOGIN
              </Button>
              
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-green-600 font-semibold text-center hover:text-green-700 transition-colors mt-2"
              >
                Change Phone Number
              </button>
            </form>
          )}
          
          <p className="mt-8 text-center text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-green-600 font-bold hover:text-green-700 transition-colors">
              Register
            </Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
