const express = require('express');
const router = express.Router();

// Campaign routes
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Get campaigns endpoint (placeholder)' });
});

router.post('/', (req, res) => {
  res.status(201).json({ message: 'Create campaign endpoint (placeholder)' });
});

router.get('/:id', (req, res) => {
  res.status(200).json({ message: `Get campaign ${req.params.id} endpoint (placeholder)` });
});

router.patch('/:id', (req, res) => {
  res.status(200).json({ message: `Update campaign ${req.params.id} endpoint (placeholder)` });
});

router.delete('/:id', (req, res) => {
  res.status(200).json({ message: `Delete campaign ${req.params.id} endpoint (placeholder)` });
});

module.exports = router; 