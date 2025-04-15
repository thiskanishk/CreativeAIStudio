const express = require('express');
const router = express.Router();

// Media routes
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Get media items endpoint (placeholder)' });
});

router.post('/upload', (req, res) => {
  res.status(201).json({ message: 'Upload media endpoint (placeholder)' });
});

router.get('/:id', (req, res) => {
  res.status(200).json({ message: `Get media ${req.params.id} endpoint (placeholder)` });
});

router.delete('/:id', (req, res) => {
  res.status(200).json({ message: `Delete media ${req.params.id} endpoint (placeholder)` });
});

module.exports = router; 