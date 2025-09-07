const express = require('express');
const router = express.Router();

// Placeholder routes — replace with real controllers later
router.get('/', (req, res) => res.json({ ok: true, service: 'appointment', message: 'appointment route root' }));
router.get('/health', (req, res) => res.json({ ok: true, service: 'appointment', status: 'healthy' }));

module.exports = router;