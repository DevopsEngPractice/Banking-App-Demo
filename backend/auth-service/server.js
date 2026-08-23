require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const User = require('./models/User');

const client = require("prom-client");

const app = express();

connectDB();

app.use(cors({ origin: '*' }));
app.use(express.json());

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({register: client.register, timeout: 5000});

app.get('/health', (req, res) => {
  res.status(200).json({ service: 'auth-service', status: 'OK', timestamp: new Date().toISOString() });
});

app.get("/metrics/auth", async(req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
})

app.use((req, res, next) => {
    console.log("================================");
    console.log("[Auth Service]");
    console.log(req.method);
    console.log(req.originalUrl);
    next();
});

app.use('/api/auth', authRoutes);

app.use((req, res, next) => {
  console.log("[Auth Service]", req.method, req.originalUrl);
  next();
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found on auth-service' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[auth-service] Error:', err.message);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// Seed a default admin account on first run so the app is usable end to end
const seedDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      await User.create({
        name: 'Bank Administrator',
        email: 'admin@bankapp.com',
        password: 'Admin@123',
        role: 'admin',
      });
      console.log('[auth-service] Default admin created -> email: admin@bankapp.com | password: Admin@123');
    }
  } catch (err) {
    console.error('[auth-service] Failed to seed default admin:', err.message);
  }
};

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`[auth-service] Running on http://localhost:${PORT}`);
  seedDefaultAdmin();
});
