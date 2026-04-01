const { validationResult } = require('express-validator');
const Alert = require('../models/Alert');

// GET /api/alerts
const getAlerts = async (req, res, next) => {
  try {
    const alerts = await Alert.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ alerts });
  } catch (err) {
    next(err);
  }
};

// POST /api/alerts
const createAlert = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { produce, notifyBySms, notifyByCall } = req.body;
    const normalizedProduce = produce.toLowerCase().trim();

    // Prevent duplicate alerts for same produce
    const existing = await Alert.findOne({ user: req.user._id, produce: normalizedProduce });
    if (existing) {
      return res.status(400).json({ message: `Aapne pehle se "${normalizedProduce}" ka alert lagaya hua hai` });
    }

    const alert = await Alert.create({
      user: req.user._id,
      produce: normalizedProduce,
      notifyBySms: notifyBySms !== false,
      notifyByCall: notifyByCall !== false,
    });

    res.status(201).json({ alert });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/alerts/:id
const deleteAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) return res.status(404).json({ message: 'Alert nahi mila' });
    if (alert.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Yeh aapka alert nahi hai' });
    }
    await alert.deleteOne();
    res.json({ message: 'Alert delete ho gaya' });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/alerts/:id  — toggle isActive
const toggleAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) return res.status(404).json({ message: 'Alert nahi mila' });
    if (alert.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Yeh aapka alert nahi hai' });
    }
    alert.isActive = req.body.isActive !== undefined ? req.body.isActive : !alert.isActive;
    await alert.save();
    res.json({ alert });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAlerts, createAlert, deleteAlert, toggleAlert };
