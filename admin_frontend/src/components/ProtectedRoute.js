import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CircularProgress, Box } from '@mui/material';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute - isAuthenticated:', isAuthenticated, 'loading:', loading, 'path:', location.pathname);

  if (loading) {
    console.log('ProtectedRoute showing loading spinner');
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    console.log('ProtectedRoute redirecting to login - not authenticated');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log('ProtectedRoute rendering children - authenticated');
  return children;
};

export default ProtectedRoute;
