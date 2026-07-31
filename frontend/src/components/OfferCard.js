import React from 'react';

const categoryIcon = {
  Loan: 'bi-cash-stack',
  'Credit Card': 'bi-credit-card-2-front',
  Savings: 'bi-piggy-bank',
  'Fixed Deposit': 'bi-safe',
  Insurance: 'bi-shield-check',
  Other: 'bi-stars',
};

const OfferCard = ({ offer, canManage, onEdit, onDelete, canDelete }) => {
  return (
    <div className="card card-offer p-3">
      <div className="card-body d-flex flex-column">
        <div className="d-flex align-items-start justify-content-between mb-2">
          <div className="icon-circle mb-2">
            <i className={`bi ${categoryIcon[offer.category] || 'bi-stars'}`}></i>
          </div>
          {!offer.isActive && <span className="badge bg-secondary">Inactive</span>}
        </div>
        <span className="badge bg-light text-dark border mb-2 align-self-start">{offer.category}</span>
        <h5 className="card-title">{offer.title}</h5>
        <p className="card-text text-muted small flex-grow-1">{offer.description}</p>
        {offer.interestRate && (
          <p className="mb-1 small"><strong>Rate:</strong> {offer.interestRate}</p>
        )}
        {offer.validTill && (
          <p className="mb-2 small text-muted">
            <i className="bi bi-calendar-event me-1"></i>
            Valid till {new Date(offer.validTill).toLocaleDateString()}
          </p>
        )}
        {canManage && (
          <div className="d-flex gap-2 mt-2">
            <button className="btn btn-sm btn-outline-primary flex-grow-1" onClick={() => onEdit(offer)}>
              <i className="bi bi-pencil-square me-1"></i>Edit
            </button>
            {canDelete && (
              <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(offer._id)}>
                <i className="bi bi-trash3"></i>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OfferCard;
