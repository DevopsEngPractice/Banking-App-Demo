const Service = require('../models/Service');

exports.getServices = async (req, res) => {
  try {
    const filter = {};
    if (!(req.query.all === 'true' && req.user && ['admin', 'employee'].includes(req.user.role))) {
      filter.isActive = true;
    }
    if (req.query.category) filter.category = req.query.category;

    const services = await Service.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: services.length, services });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    res.status(200).json({ success: true, service });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.createService = async (req, res) => {
  try {
    const { name, description, icon, category, isActive } = req.body;
    if (!name || !description) {
      return res.status(400).json({ success: false, message: 'Name and description are required' });
    }
    const service = await Service.create({
      name,
      description,
      icon,
      category,
      isActive,
      createdBy: req.user.id,
      createdByName: req.user.name,
    });
    res.status(201).json({ success: true, message: 'Service created', service });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.updateService = async (req, res) => {
  try {
    const { name, description, icon, category, isActive } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (description !== undefined) update.description = description;
    if (icon !== undefined) update.icon = icon;
    if (category !== undefined) update.category = category;
    if (isActive !== undefined) update.isActive = isActive;

    const service = await Service.findByIdAndUpdate(req.params.id, { $set: update }, { new: true, runValidators: true });
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });

    res.status(200).json({ success: true, message: 'Service updated', service });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    res.status(200).json({ success: true, message: 'Service deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
