import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import OfferCard from '../components/OfferCard';
import ServiceCard from '../components/ServiceCard';

const Home = () => {
  const [offers, setOffers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [offersRes, servicesRes] = await Promise.all([
          api.get('/offers'),
          api.get('/services'),
        ]);
        setOffers(offersRes.data.offers.slice(0, 3));
        setServices(servicesRes.data.services.slice(0, 4));
      } catch (error) {
        console.error('Failed to load home page data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="hero-section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-7">
              <h1 className="display-5 fw-bold mb-3">Banking that puts you first</h1>
              <p className="lead mb-4">
                Explore exclusive offers, discover our full range of banking services, and manage
                everything securely from one place.
              </p>
              <div className="d-flex flex-wrap gap-2">
                <Link to="/offers" className="btn btn-bank-accent btn-lg">
                  <i className="bi bi-gift me-2"></i>View Offers
                </Link>
                <Link to="/register" className="btn btn-outline-light btn-lg">
                  Open an Account
                </Link>
              </div>
            </div>
            <div className="col-lg-5 d-none d-lg-block text-center">
              <i className="bi bi-bank2" style={{ fontSize: '12rem', opacity: 0.25 }}></i>
            </div>
          </div>
        </div>
      </section>

      {/* Offers preview */}
      <section className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="h3 mb-0">Featured Offers</h2>
          <Link to="/offers" className="btn btn-sm btn-outline-primary">View All</Link>
        </div>
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        ) : (
          <div className="row g-4">
            {offers.map((offer) => (
              <div className="col-12 col-md-6 col-lg-4" key={offer._id}>
                <OfferCard offer={offer} canManage={false} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Services preview */}
      <section className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="h3 mb-0">Our Services</h2>
          <Link to="/services" className="btn btn-sm btn-outline-primary">View All</Link>
        </div>
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        ) : (
          <div className="row g-4">
            {services.map((service) => (
              <div className="col-12 col-sm-6 col-lg-3" key={service._id}>
                <ServiceCard service={service} canManage={false} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Why us */}
      <section className="bg-white py-5">
        <div className="container">
          <h2 className="h3 text-center mb-5">Why Choose SecureTrust Bank</h2>
          <div className="row g-4 text-center">
            <div className="col-md-4">
              <i className="bi bi-shield-lock display-5 text-primary"></i>
              <h5 className="mt-3">Secure by Design</h5>
              <p className="text-muted small">JWT-based authentication with role-based access control keeps your data safe.</p>
            </div>
            <div className="col-md-4">
              <i className="bi bi-lightning-charge display-5 text-primary"></i>
              <h5 className="mt-3">Fast & Reliable</h5>
              <p className="text-muted small">Built on a scalable microservices architecture for high availability.</p>
            </div>
            <div className="col-md-4">
              <i className="bi bi-phone display-5 text-primary"></i>
              <h5 className="mt-3">Bank Anywhere</h5>
              <p className="text-muted small">Fully responsive design lets you bank from any device, anytime.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
