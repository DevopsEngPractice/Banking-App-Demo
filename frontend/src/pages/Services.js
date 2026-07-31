import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import ServiceCard from '../components/ServiceCard';
import { useAuth } from '../context/AuthContext';

const emptyForm = {
  name: '',
  description: '',
  icon: 'bi-bank2',
  category: 'Personal Banking',
  isActive: true,
};

const categories = ['Personal Banking', 'Business Banking', 'Digital Banking', 'Loans', 'Investments', 'Other'];
const iconOptions = [
  'bi-bank2', 'bi-piggy-bank', 'bi-cash-coin', 'bi-credit-card', 'bi-phone',
  'bi-briefcase', 'bi-graph-up-arrow', 'bi-shield-check', 'bi-wallet2', 'bi-house-door',
];

const Services = () => {
  const { user } = useAuth();
  const canManage = user && ['admin', 'employee'].includes(user.role);
  const canDelete = user && user.role === 'admin';

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (canManage) params.all = 'true';
      if (filterCategory) params.category = filterCategory;
      const res = await api.get('/services', { params });
      setServices(res.data.services);
    } catch (error) {
      console.error('Failed to fetch services', error);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCategory, canManage]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (service) => {
    setEditingId(service._id);
    setFormData({
      name: service.name,
      description: service.description,
      icon: service.icon || 'bi-bank2',
      category: service.category,
      isActive: service.isActive,
    });
    setFormError('');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      await api.delete(`/services/${id}`);
      fetchServices();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete service');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/services/${editingId}`, formData);
      } else {
        await api.post('/services', formData);
      }
      setShowModal(false);
      fetchServices();
    } catch (error) {
      setFormError(error.response?.data?.message || 'Failed to save service');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div>
          <h2 className="mb-1">Bank Services</h2>
          <p className="text-muted mb-0">Everything you need for personal and business banking.</p>
        </div>
        {canManage && (
          <button className="btn btn-bank-primary" onClick={openCreateModal}>
            <i className="bi bi-plus-lg me-1"></i>New Service
          </button>
        )}
      </div>

      <div className="mb-4" style={{ maxWidth: '260px' }}>
        <select
          className="form-select"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-inbox display-4"></i>
          <p className="mt-2">No services found.</p>
        </div>
      ) : (
        <div className="row g-4">
          {services.map((service) => (
            <div className="col-12 col-sm-6 col-lg-4" key={service._id}>
              <ServiceCard
                service={service}
                canManage={canManage}
                canDelete={canDelete}
                onEdit={openEditModal}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <>
          <div className="modal d-block" tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <form onSubmit={handleSubmit}>
                  <div className="modal-header">
                    <h5 className="modal-title">{editingId ? 'Edit Service' : 'Create New Service'}</h5>
                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                  </div>
                  <div className="modal-body">
                    {formError && <div className="alert alert-danger py-2">{formError}</div>}
                    <div className="mb-3">
                      <label className="form-label">Service Name</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      ></textarea>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Category</label>
                        <select
                          className="form-select"
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                          {categories.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Icon</label>
                        <select
                          className="form-select"
                          value={formData.icon}
                          onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                        >
                          {iconOptions.map((i) => (
                            <option key={i} value={i}>{i}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="svcIsActiveCheck"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      />
                      <label className="form-check-label" htmlFor="svcIsActiveCheck">Active</label>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-bank-primary" disabled={saving}>
                      {saving ? 'Saving...' : editingId ? 'Update Service' : 'Create Service'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show"></div>
        </>
      )}
    </div>
  );
};

export default Services;
