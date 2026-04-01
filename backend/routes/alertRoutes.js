const express = require('express');
const { body } = require('express-validator');
const { getAlerts, createAlert, deleteAlert, toggleAlert } = require('../controllers/alertController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getAlerts);

router.post(
  '/',
  protect,
  [body('produce').notEmpty().trim().withMessage('Sabzi/fruit ka naam daale')],
  createAlert
);

router.delete('/:id', protect, deleteAlert);

router.patch('/:id', protect, toggleAlert);

module.exports = router;
