import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="container py-5 text-center">
      <i className="bi bi-signpost-2 display-1 text-primary"></i>
      <h1 className="mt-3">404</h1>
      <p className="text-muted mb-4">The page you are looking for doesn't exist.</p>
      <Link to="/" className="btn btn-bank-primary">
        <i className="bi bi-house-door me-1"></i>Back to Home
      </Link>
    </div>
  );
};

export default NotFound;
