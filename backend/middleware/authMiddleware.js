import admin from '../firebaseAdmin.js';
import User from '../models/User.js';

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided, authorization denied' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // Firebase token payload

    // Try to find the user in MongoDB
    const dbUser = await User.findOne({ firebaseUid: decodedToken.uid });
    if (dbUser) {
      req.dbUser = dbUser;
    }

    next();
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    res.status(401).json({ message: 'Token is invalid or expired' });
  }
};

export const isFarmer = (req, res, next) => {
  if (req.dbUser && req.dbUser.role === 'FARMER') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Farmer role required.' });
  }
};

export const isBuyer = (req, res, next) => {
  if (req.dbUser && req.dbUser.role === 'BUYER') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Buyer role required.' });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.dbUser && req.dbUser.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
};
