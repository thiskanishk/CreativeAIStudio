const express = require('express');
const router = express.Router();

// Asset routes
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Get assets endpoint (placeholder)' });
});

router.post('/', (req, res) => {
  res.status(201).json({ message: 'Create asset endpoint (placeholder)' });
});

router.get('/:id', (req, res) => {
  res.status(200).json({ message: `Get asset ${req.params.id} endpoint (placeholder)` });
});

router.patch('/:id', (req, res) => {
  res.status(200).json({ message: `Update asset ${req.params.id} endpoint (placeholder)` });
});

router.delete('/:id', (req, res) => {
  res.status(200).json({ message: `Delete asset ${req.params.id} endpoint (placeholder)` });
});

module.exports = router; 