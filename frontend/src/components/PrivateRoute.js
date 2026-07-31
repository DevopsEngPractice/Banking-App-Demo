import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Wrap protected pages: <PrivateRoute roles={['admin']}><AdminUsers /></PrivateRoute>
// If `roles` is omitted, any authenticated user is allowed.
const PrivateRoute = ({ children, roles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="container py-5 text-center">
        <i className="bi bi-shield-lock display-1 text-danger"></i>
        <h3 className="mt-3">Access Denied</h3>
        <p className="text-muted">You do not have permission to view this page.</p>
      </div>
    );
  }

  return children;
};

export default PrivateRoute;
