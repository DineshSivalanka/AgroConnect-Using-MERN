import express from 'express';
import OtpVerification from '../models/OtpVerification.js';
import User from '../models/User.js';

// Generate OTP (Mock)
export const generateOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    // In a real application, you'd integrate with SMS service here
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); 
    
    const otpVerification = new OtpVerification({ phone, otp });
    await otpVerification.save();
    
    res.status(200).json({ message: 'OTP sent successfully', otp }); // Don't return OTP in prod
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify OTP
export const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const record = await OtpVerification.findOne({ phone, otp });
    
    if (!record) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    
    await OtpVerification.deleteOne({ _id: record._id });
    
    // Also verify user if not verified
    const user = await User.findOne({ phone });
    if (user && !user.isVerified) {
      user.isVerified = true;
      await user.save();
    }
    
    res.status(200).json({ message: 'OTP verified successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
