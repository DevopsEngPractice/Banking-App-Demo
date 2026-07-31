import React from 'react';

const Footer = () => {
  return (
    <footer className="bank-footer py-4 mt-5">
      <div className="container">
        <div className="row gy-3">
          <div className="col-12 col-md-4">
            <h5 className="text-white"><i className="bi bi-bank2 me-2"></i>SecureTrust Bank</h5>
            <p className="small mb-0">Your trusted partner in banking since forever. Demo application built with the MERN stack.</p>
          </div>
          <div className="col-6 col-md-4">
            <h6 className="text-white">Quick Links</h6>
            <ul className="list-unstyled small">
              <li><a href="/offers" className="text-decoration-none text-light">Offers</a></li>
              <li><a href="/services" className="text-decoration-none text-light">Services</a></li>
              <li><a href="/login" className="text-decoration-none text-light">Login</a></li>
            </ul>
          </div>
          <div className="col-6 col-md-4">
            <h6 className="text-white">Contact</h6>
            <ul className="list-unstyled small mb-0">
              <li><i className="bi bi-envelope me-2"></i>support@securetrust.bank</li>
              <li><i className="bi bi-telephone me-2"></i>1800-000-0000</li>
            </ul>
          </div>
        </div>
        <hr className="border-secondary" />
        <p className="text-center small mb-0">&copy; {new Date().getFullYear()} SecureTrust Bank. Demo project — not a real bank.</p>
      </div>
    </footer>
  );
};

export default Footer;
