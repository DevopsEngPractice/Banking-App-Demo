require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const serviceRoutes = require('./routes/serviceRoutes');
const Service = require('./models/Service');

const client = require("prom-client");


const app = express();

connectDB();

app.use(cors({ origin: '*' }));
app.use(express.json());

const collectDefaultMetrics = client.collectDefaultMetrics;

collectDefaultMetrics({timeout: 5000});

app.get('/health', (req, res) => {
  res.status(200).json({ service: 'services-service', status: 'OK', timestamp: new Date().toISOString() });
});

app.get("/metrics/service", async(req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
})

app.use('/api/services', serviceRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found on services-service' });
});

app.use((err, req, res, next) => {
  console.error('[services-service] Error:', err.message);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const seedServices = async () => {
  try {
    const count = await Service.countDocuments();
    if (count === 0) {
      await Service.insertMany([
        {
          name: 'Savings Account',
          description: 'Open a zero-balance savings account with free debit card and mobile banking access.',
          icon: 'bi-piggy-bank',
          category: 'Personal Banking',
          isActive: true,
          createdBy: 'system',
          createdByName: 'Bank System',
        },
        {
          name: 'Personal Loans',
          description: 'Quick, collateral-free personal loans with flexible repayment tenures up to 5 years.',
          icon: 'bi-cash-coin',
          category: 'Loans',
          isActive: true,
          createdBy: 'system',
          createdByName: 'Bank System',
        },
        {
          name: 'Internet & Mobile Banking',
          description: 'Manage your accounts, pay bills and transfer funds anytime with our secure digital platform.',
          icon: 'bi-phone',
          category: 'Digital Banking',
          isActive: true,
          createdBy: 'system',
          createdByName: 'Bank System',
        },
        {
          name: 'Business Current Account',
          description: 'Dedicated banking solutions for businesses with overdraft facilities and dedicated relationship managers.',
          icon: 'bi-briefcase',
          category: 'Business Banking',
          isActive: true,
          createdBy: 'system',
          createdByName: 'Bank System',
        },
        {
          name: 'Mutual Funds & Investments',
          description: 'Grow your wealth with curated investment products guided by our financial advisors.',
          icon: 'bi-graph-up-arrow',
          category: 'Investments',
          isActive: true,
          createdBy: 'system',
          createdByName: 'Bank System',
        },
      ]);
      console.log('[services-service] Sample services seeded');
    }
  } catch (err) {
    console.error('[services-service] Failed to seed services:', err.message);
  }
};

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log(`[services-service] Running on http://localhost:${PORT}`);
  seedServices();
});
