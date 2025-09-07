const express = require('express');
const router = express.Router();

// Replace with real controllers later
router.get('/', (req, res) => res.json({ ok: true, service: 'pharmacy', message: 'pharmacy route root' }));
router.get('/health', (req, res) => res.json({ ok: true, service: 'pharmacy', status: 'healthy' }));

module.exports = router;