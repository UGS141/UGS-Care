const express = require('express');
const router = express.Router();

// Replace with real controllers later
router.get('/', (req, res) => res.json({ ok: true, service: 'doctor', message: 'doctor route root' }));
router.get('/health', (req, res) => res.json({ ok: true, service: 'doctor', status: 'healthy' }));

module.exports = router;