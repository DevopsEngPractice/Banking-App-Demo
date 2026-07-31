const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Service description is required'],
    },
    icon: {
      type: String, // bootstrap-icons class name, e.g. "bi-piggy-bank"
      default: 'bi-bank2',
    },
    category: {
      type: String,
      enum: ['Personal Banking', 'Business Banking', 'Digital Banking', 'Loans', 'Investments', 'Other'],
      default: 'Other',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: String,
      required: true,
    },
    createdByName: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Service', ServiceSchema);
