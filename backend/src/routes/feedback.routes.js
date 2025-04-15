const express = require('express');
const router = express.Router();

// Feedback routes
router.post('/', (req, res) => {
  res.status(201).json({ message: 'Submit feedback endpoint (placeholder)' });
});

router.get('/', (req, res) => {
  res.status(200).json({ message: 'Get feedback list endpoint (placeholder)' });
});

module.exports = router; 