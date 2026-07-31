import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="container py-5">
      <div className="row">
        {/* Sidebar */}
        <div className="col-lg-3 mb-4">
          <div className="dashboard-sidebar p-3">
            <div className="text-center mb-3">
              <i className="bi bi-person-circle display-4 text-primary"></i>
              <h6 className="mt-2 mb-0">{user.name}</h6>
              <small className="text-muted text-uppercase">{user.role}</small>
            </div>
            <ul className="nav flex-column">
              <li className="nav-item">
                <Link className="nav-link active" to="/dashboard"><i className="bi bi-speedometer2 me-2"></i>Overview</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/profile"><i className="bi bi-person me-2"></i>My Profile</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/offers"><i className="bi bi-gift me-2"></i>Offers</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/services"><i className="bi bi-grid me-2"></i>Services</Link>
              </li>
              {user.role === 'admin' && (
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/users"><i className="bi bi-people me-2"></i>Manage Users</Link>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Main content */}
        <div className="col-lg-9">
          <h2 className="mb-1">Welcome back, {user.name.split(' ')[0]} 👋</h2>
          <p className="text-muted mb-4">Here's what's happening with your account today.</p>

          <div className="row g-4 mb-4">
            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="icon-circle mb-2"><i className="bi bi-wallet2"></i></div>
                  <h6 className="text-muted">Account Number</h6>
                  <p className="h5 mb-0">{user.accountNumber}</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="icon-circle mb-2"><i className="bi bi-shield-check"></i></div>
                  <h6 className="text-muted">Access Level</h6>
                  <p className="h5 mb-0 text-capitalize">{user.role}</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="icon-circle mb-2"><i className="bi bi-calendar-check"></i></div>
                  <h6 className="text-muted">Member Since</h6>
                  <p className="h5 mb-0">{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Role-specific panel */}
          {user.role === 'admin' && (
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <h5><i className="bi bi-stars text-warning me-2"></i>Administrator Access</h5>
                <p className="text-muted mb-3">
                  You have full access to the system: manage all users (admins, employees, and customers),
                  and create, edit or delete offers and services.
                </p>
                <Link to="/admin/users" className="btn btn-bank-primary btn-sm me-2">Manage Users</Link>
                <Link to="/offers" className="btn btn-outline-primary btn-sm me-2">Manage Offers</Link>
                <Link to="/services" className="btn btn-outline-primary btn-sm">Manage Services</Link>
              </div>
            </div>
          )}

          {user.role === 'employee' && (
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <h5><i className="bi bi-briefcase text-info me-2"></i>Employee Access</h5>
                <p className="text-muted mb-3">
                  You can create and update bank offers and services. Deleting content and managing user
                  accounts is restricted to administrators.
                </p>
                <Link to="/offers" className="btn btn-bank-primary btn-sm me-2">Manage Offers</Link>
                <Link to="/services" className="btn btn-outline-primary btn-sm">Manage Services</Link>
              </div>
            </div>
          )}

          {user.role === 'user' && (
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <h5><i className="bi bi-eye text-primary me-2"></i>Customer Access</h5>
                <p className="text-muted mb-3">
                  Browse the latest bank offers and services, and keep your profile information up to date.
                </p>
                <Link to="/offers" className="btn btn-bank-primary btn-sm me-2">Browse Offers</Link>
                <Link to="/services" className="btn btn-outline-primary btn-sm">Browse Services</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
