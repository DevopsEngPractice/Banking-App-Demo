import React, { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, updateUserInContext } = useAuth();
  const [formData, setFormData] = useState({ name: user.name, phone: user.phone || '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setSaving(true);
    try {
      const res = await api.put('/auth/me', formData);
      updateUserInContext(res.data.user);
      setMessage('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-6">
          <h2 className="mb-4">My Profile</h2>
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              {message && <div className="alert alert-success py-2">{message}</div>}
              {error && <div className="alert alert-danger py-2">{error}</div>}

              <div className="mb-3">
                <label className="form-label text-muted small">Email (cannot be changed)</label>
                <input type="email" className="form-control" value={user.email} disabled />
              </div>
              <div className="mb-3">
                <label className="form-label text-muted small">Account Number</label>
                <input type="text" className="form-control" value={user.accountNumber} disabled />
              </div>
              <div className="mb-3">
                <label className="form-label text-muted small">Role</label>
                <input type="text" className="form-control text-capitalize" value={user.role} disabled />
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn btn-bank-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
