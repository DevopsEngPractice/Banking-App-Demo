require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use(cors({ origin: '*' }));

// Gateway health check (does not need JSON body parsing / proxy handles its own body)
app.get('/health', (req, res) => {
  res.status(200).json({ service: 'api-gateway', status: 'OK', timestamp: new Date().toISOString() });
});

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5001';
const OFFERS_SERVICE_URL = process.env.OFFERS_SERVICE_URL || 'http://localhost:5002';
const SERVICES_SERVICE_URL = process.env.SERVICES_SERVICE_URL || 'http://localhost:5003';

// Route: /api/auth/**  -> auth-service
// NOTE: app.use('/api/auth', ...) makes Express strip the "/api/auth" prefix
// before the proxy middleware ever sees the request. pathRewrite puts it back
// on so the target service (whose routes are mounted at /api/auth/...) gets
// the full path it expects.
app.use(
  '/api/auth',
  createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/': '/api/auth/' },
    on: {
      proxyReq: (proxyReq, req) => {
        //console.log(`[Gateway] ${req.method} ${req.originalUrl}`);
        
        console.log("================================");
        console.log("[Gateway] Incoming Request");
        console.log("Method :", req.method);
        console.log("URL    :", req.originalUrl);
        console.log("Target :", AUTH_SERVICE_URL);

      },
      proxyRes: (proxyRes, req) => {
        //console.log(`[Gateway] Response ${proxyRes.statusCode} for ${req.originalUrl}`);

        console.log("[Gateway] Response");
        console.log("Status :", proxyRes.statusCode);
        console.log("URL    :", req.originalUrl);

      },

      error: (err, req, res) => {
        console.error("[Gateway Error]", err);
        res.status(502).json({
          success: false,
          message: err.message,
        });

       // res.status(502).json({ success: false, message: 'auth-service is unreachable', error: err.message });
      },
    },
  })
);

// Route: /api/offers/** -> offers-service
app.use(
  '/api/offers',
  createProxyMiddleware({
    target: OFFERS_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/': '/api/offers/' },

    on: {
      proxyReq: (proxyReq, req) => {
        //console.log(`[Gateway] ${req.method} ${req.originalUrl}`);

        console.log("================================");
        console.log("[Gateway] Incoming Request");
        console.log("Method :", req.method);
        console.log("URL    :", req.originalUrl);
        console.log("Target :", AUTH_SERVICE_URL);
      },
      proxyRes: (proxyRes, req) => {
        //console.log(`[Gateway] Response ${proxyRes.statusCode} for ${req.originalUrl}`);

        console.log("[Gateway] Response");
        console.log("Status :", proxyRes.statusCode);
        console.log("URL    :", req.originalUrl);
      },
      error: (err, req, res) => {
        //console.error("[Gateway Error]", err);
        //res.status(502).json({ success: false, message: 'offers-service is unreachable', error: err.message });

        console.error("[Gateway Error]", err);

        res.status(502).json({
          success: false,
          message: err.message,
        });
      },
    },
  })
);

// Route: /api/services/** -> services-service
app.use(
  '/api/services',
  createProxyMiddleware({
    target: SERVICES_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/': '/api/services/' },
    on: {
      proxyReq: (proxyReq, req) => {
        //console.log(`[Gateway] ${req.method} ${req.originalUrl}`);

        console.log("================================");
        console.log("[Gateway] Incoming Request");
        console.log("Method :", req.method);
        console.log("URL    :", req.originalUrl);
        console.log("Target :", AUTH_SERVICE_URL);
      },
      proxyRes: (proxyRes, req) => {
        //console.log(`[Gateway] Response ${proxyRes.statusCode} for ${req.originalUrl}`);

        console.log("[Gateway] Response");
        console.log("Status :", proxyRes.statusCode);
        console.log("URL    :", req.originalUrl);
      },

      error: (err, req, res) => {
        //console.error("[Gateway Error]", err);
        //res.status(502).json({ success: false, message: 'services-service is unreachable', error: err.message });

        console.error("[Gateway Error]", err);

        res.status(502).json({
          success: false,
          message: err.message,
        });
      },
    },
  })
);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found on API gateway' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[api-gateway] Running on http://localhost:${PORT}`);
  console.log(`[api-gateway] -> /api/auth     => ${AUTH_SERVICE_URL}`);
  console.log(`[api-gateway] -> /api/offers   => ${OFFERS_SERVICE_URL}`);
  console.log(`[api-gateway] -> /api/services => ${SERVICES_SERVICE_URL}`);
});