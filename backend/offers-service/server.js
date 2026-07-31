require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const offerRoutes = require('./routes/offerRoutes');
const Offer = require('./models/Offer');

const app = express();

connectDB();

app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ service: 'offers-service', status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api/offers', offerRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found on offers-service' });
});

app.use((err, req, res, next) => {
  console.error('[offers-service] Error:', err.message);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const seedOffers = async () => {
  try {
    const count = await Offer.countDocuments();
    if (count === 0) {
      await Offer.insertMany([
        {
          title: 'Home Loan Festive Special',
          description: 'Enjoy discounted processing fees and quick approval on home loans this season.',
          category: 'Loan',
          interestRate: '8.35% p.a. onwards',
          isActive: true,
          createdBy: 'system',
          createdByName: 'Bank System',
        },
        {
          title: 'Platinum Rewards Credit Card',
          description: 'Earn 5x reward points on dining and travel with zero annual fee for the first year.',
          category: 'Credit Card',
          interestRate: 'N/A',
          isActive: true,
          createdBy: 'system',
          createdByName: 'Bank System',
        },
        {
          title: 'High-Yield Savings Account',
          description: 'Grow your savings faster with our best-in-class interest rate and no minimum balance.',
          category: 'Savings',
          interestRate: '7.10% p.a.',
          isActive: true,
          createdBy: 'system',
          createdByName: 'Bank System',
        },
        {
          title: '1-Year Fixed Deposit Bonus',
          description: 'Lock in a guaranteed high return with our limited-period fixed deposit offer.',
          category: 'Fixed Deposit',
          interestRate: '7.75% p.a.',
          isActive: true,
          createdBy: 'system',
          createdByName: 'Bank System',
        },
      ]);
      console.log('[offers-service] Sample offers seeded');
    }
  } catch (err) {
    console.error('[offers-service] Failed to seed offers:', err.message);
  }
};

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`[offers-service] Running on http://localhost:${PORT}`);
  seedOffers();
});
