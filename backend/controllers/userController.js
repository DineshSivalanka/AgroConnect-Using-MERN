import express from 'express';
import User from '../models/User.js';
import admin from '../firebaseAdmin.js';

// Helper function to verify Firebase ID Token
const verifyIdToken = async (idToken) => {
  if (!idToken) throw new Error("No ID Token provided");
  if (!admin.apps.length) throw new Error("Firebase Admin not initialized on the server");
  
  const decodedToken = await admin.auth().verifyIdToken(idToken);
  return decodedToken;
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
    let decodedToken;
    try {
      decodedToken = await verifyIdToken(idToken);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired authentication token', error: err.message });
    }

    const phone = decodedToken.phone_number;
    const uid = decodedToken.uid;

    if (!phone) {
      return res.status(400).json({ message: 'Phone number not found in token' });
    }

    // Enforce Admin Access
    const ADMIN_PHONE = '+919542643859';
    let finalRole = role;
    if (phone === ADMIN_PHONE) {
      finalRole = 'ADMIN';
    } else if (role === 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden: Only the designated phone number can be an Admin' });
    }

    // 2. Check if user already exists
    let user = await User.findOne({ firebaseUid: uid });
    if (!user) {
      user = await User.findOne({ phone });
    }
    
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 3. Create user
    user = new User({ 
      name, 
      phone, 
      firebaseUid: uid,
      role: finalRole, 
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
    let decodedToken;
    try {
      decodedToken = await verifyIdToken(idToken);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired authentication token', error: err.message });
    }

    const uid = decodedToken.uid;
    const phone = decodedToken.phone_number;

    // Enforce Admin Access
    const ADMIN_PHONE = '+919542643859';
    let finalRole = role;
    if (phone === ADMIN_PHONE) {
      finalRole = 'ADMIN';
    } else if (role === 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden: Only the designated phone number can be an Admin' });
    }

    // 2. Find user in our database
    const user = await User.findOne({ firebaseUid: uid, role: finalRole });
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

// Get current user (me)
export const getCurrentUser = async (req, res) => {
  try {
    if (!req.dbUser) {
      return res.status(404).json({ message: 'User not found in database' });
    }
    res.status(200).json(req.dbUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
