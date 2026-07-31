import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import OfferCard from '../components/OfferCard';
import { useAuth } from '../context/AuthContext';

const emptyForm = {
  title: '',
  description: '',
  category: 'Loan',
  interestRate: '',
  validTill: '',
  isActive: true,
};

const categories = ['Loan', 'Credit Card', 'Savings', 'Fixed Deposit', 'Insurance', 'Other'];

const Offers = () => {
  const { user } = useAuth();
  const canManage = user && ['admin', 'employee'].includes(user.role);
  const canDelete = user && user.role === 'admin';

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');

  const fetchOffers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (canManage) params.all = 'true';
      if (filterCategory) params.category = filterCategory;
      const res = await api.get('/offers', { params });
      setOffers(res.data.offers);
    } catch (error) {
      console.error('Failed to fetch offers', error);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCategory, canManage]);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (offer) => {
    setEditingId(offer._id);
    setFormData({
      title: offer.title,
      description: offer.description,
      category: offer.category,
      interestRate: offer.interestRate || '',
      validTill: offer.validTill ? offer.validTill.split('T')[0] : '',
      isActive: offer.isActive,
    });
    setFormError('');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) return;
    try {
      await api.delete(`/offers/${id}`);
      fetchOffers();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete offer');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/offers/${editingId}`, formData);
      } else {
        await api.post('/offers', formData);
      }
      setShowModal(false);
      fetchOffers();
    } catch (error) {
      setFormError(error.response?.data?.message || 'Failed to save offer');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div>
          <h2 className="mb-1">Bank Offers</h2>
          <p className="text-muted mb-0">Exclusive deals on loans, cards, savings and more.</p>
        </div>
        {canManage && (
          <button className="btn btn-bank-primary" onClick={openCreateModal}>
            <i className="bi bi-plus-lg me-1"></i>New Offer
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
      ) : offers.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-inbox display-4"></i>
          <p className="mt-2">No offers found.</p>
        </div>
      ) : (
        <div className="row g-4">
          {offers.map((offer) => (
            <div className="col-12 col-md-6 col-lg-4" key={offer._id}>
              <OfferCard
                offer={offer}
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
                    <h5 className="modal-title">{editingId ? 'Edit Offer' : 'Create New Offer'}</h5>
                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                  </div>
                  <div className="modal-body">
                    {formError && <div className="alert alert-danger py-2">{formError}</div>}
                    <div className="mb-3">
                      <label className="form-label">Title</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                        <label className="form-label">Interest Rate</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. 7.5% p.a."
                          value={formData.interestRate}
                          onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Valid Till</label>
                        <input
                          type="date"
                          className="form-control"
                          value={formData.validTill}
                          onChange={(e) => setFormData({ ...formData, validTill: e.target.value })}
                        />
                      </div>
                      <div className="col-md-6 mb-3 d-flex align-items-end">
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="isActiveCheck"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                          />
                          <label className="form-check-label" htmlFor="isActiveCheck">Active</label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-bank-primary" disabled={saving}>
                      {saving ? 'Saving...' : editingId ? 'Update Offer' : 'Create Offer'}
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

export default Offers;
