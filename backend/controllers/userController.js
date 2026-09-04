import express from 'express';
import User from '../models/User.js';
import admin from '../firebaseAdmin.js';

// Helper function to verify Firebase ID Token
const verifyIdToken = async (idToken) => {
  if (!idToken) throw new Error("No ID Token provided");
  if (!admin.apps.length) throw new Error("Firebase Admin not initialized on the server");
  
  const decodedToken = await admin.auth().verifyIdToken(idToken);
  return decodedToken.phone_number;
};

// Get all users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new user (via Firebase Auth)
export const createUser = async (req, res) => {
  try {
    const { idToken, name, role, location } = req.body;
    
    // 1. Verify token with Firebase
    let phone;
    try {
      phone = await verifyIdToken(idToken);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired authentication token', error: err.message });
    }

    if (!phone) {
      return res.status(400).json({ message: 'Phone number not found in token' });
    }

    // 2. Check if user already exists
    let user = await User.findOne({ phone });
    if (user) {
      return res.status(400).json({ message: 'User already exists with this phone number' });
    }

    // 3. Create user
    user = new User({ 
      name, 
      phone, 
      role, 
      location,
      isVerified: true // Automatically verified since they used OTP
    });
    await user.save();
    
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Login user (via Firebase Auth)
export const loginUser = async (req, res) => {
  try {
    const { idToken, role } = req.body;
    
    // 1. Verify token with Firebase
    let phone;
    try {
      phone = await verifyIdToken(idToken);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired authentication token', error: err.message });
    }

    if (!phone) {
      return res.status(400).json({ message: 'Phone number not found in token' });
    }

    // 2. Find user in our database
    const user = await User.findOne({ phone, role });
    if (!user) {
      return res.status(401).json({ message: 'User not found or incorrect role selected' });
    }
    
    // Ensure they are verified
    if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user profile
export const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update user verification
export const verifyUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
