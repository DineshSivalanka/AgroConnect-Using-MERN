import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { currentUser, dbUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Wait for dbUser to load if we have a currentUser
  if (currentUser && !dbUser) {
    return <div className="flex justify-center items-center h-screen">Loading user details...</div>;
  }

  if (allowedRoles && !allowedRoles.includes(dbUser.role)) {
    // Redirect based on role
    if (dbUser.role === 'FARMER') return <Navigate to="/farmer-dashboard" replace />;
    if (dbUser.role === 'BUYER') return <Navigate to="/buyer-dashboard" replace />;
    if (dbUser.role === 'ADMIN') return <Navigate to="/admin-dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
