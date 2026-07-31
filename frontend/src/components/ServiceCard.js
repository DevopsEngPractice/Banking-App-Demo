import React from 'react';

const ServiceCard = ({ service, canManage, onEdit, onDelete, canDelete }) => {
  return (
    <div className="card card-service p-3">
      <div className="card-body d-flex flex-column">
        <div className="d-flex align-items-start justify-content-between mb-2">
          <div className="icon-circle mb-2">
            <i className={`bi ${service.icon || 'bi-bank2'}`}></i>
          </div>
          {!service.isActive && <span className="badge bg-secondary">Inactive</span>}
        </div>
        <span className="badge bg-light text-dark border mb-2 align-self-start">{service.category}</span>
        <h5 className="card-title">{service.name}</h5>
        <p className="card-text text-muted small flex-grow-1">{service.description}</p>
        {canManage && (
          <div className="d-flex gap-2 mt-2">
            <button className="btn btn-sm btn-outline-primary flex-grow-1" onClick={() => onEdit(service)}>
              <i className="bi bi-pencil-square me-1"></i>Edit
            </button>
            {canDelete && (
              <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(service._id)}>
                <i className="bi bi-trash3"></i>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceCard;
