const Offer = require('../models/Offer');

// @route  GET /api/offers
// @desc   Public/Authenticated: list active offers (everyone can view)
exports.getOffers = async (req, res) => {
  try {
    const filter = {};
    // Admin/Employee can pass ?all=true to see inactive offers too
    if (!(req.query.all === 'true' && req.user && ['admin', 'employee'].includes(req.user.role))) {
      filter.isActive = true;
    }
    if (req.query.category) filter.category = req.query.category;

    const offers = await Offer.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: offers.length, offers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @route  GET /api/offers/:id
exports.getOfferById = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });
    res.status(200).json({ success: true, offer });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @route  POST /api/offers
// @desc   Admin/Employee: create a new offer
exports.createOffer = async (req, res) => {
  try {
    const { title, description, category, interestRate, validTill, isActive } = req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required' });
    }
    const offer = await Offer.create({
      title,
      description,
      category,
      interestRate,
      validTill,
      isActive,
      createdBy: req.user.id,
      createdByName: req.user.name,
    });
    res.status(201).json({ success: true, message: 'Offer created', offer });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @route  PUT /api/offers/:id
// @desc   Admin/Employee: update an offer
exports.updateOffer = async (req, res) => {
  try {
    const { title, description, category, interestRate, validTill, isActive } = req.body;
    const update = {};
    if (title !== undefined) update.title = title;
    if (description !== undefined) update.description = description;
    if (category !== undefined) update.category = category;
    if (interestRate !== undefined) update.interestRate = interestRate;
    if (validTill !== undefined) update.validTill = validTill;
    if (isActive !== undefined) update.isActive = isActive;

    const offer = await Offer.findByIdAndUpdate(req.params.id, { $set: update }, { new: true, runValidators: true });
    if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });

    res.status(200).json({ success: true, message: 'Offer updated', offer });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @route  DELETE /api/offers/:id
// @desc   Admin only: delete an offer (Employee cannot delete)
exports.deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);
    if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });
    res.status(200).json({ success: true, message: 'Offer deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
