import mongoose from 'mongoose';

const otpVerificationSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true
  },
  otp: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300 // OTP expires in 5 minutes
  }
});

const OtpVerification = mongoose.model('OtpVerification', otpVerificationSchema);
export default OtpVerification;
