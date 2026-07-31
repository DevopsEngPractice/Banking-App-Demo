const mongoose = require('mongoose');

const OfferSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Offer title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Offer description is required'],
    },
    category: {
      type: String,
      enum: ['Loan', 'Credit Card', 'Savings', 'Fixed Deposit', 'Insurance', 'Other'],
      default: 'Other',
    },
    interestRate: {
      type: String,
      default: '',
    },
    validTill: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: String, // storing the user id (string) of the admin/employee who created it
      required: true,
    },
    createdByName: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Offer', OfferSchema);
