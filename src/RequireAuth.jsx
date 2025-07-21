import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const RequireAuth = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  const location = useLocation();
  if (!token) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  return children;
};

export default RequireAuth;
