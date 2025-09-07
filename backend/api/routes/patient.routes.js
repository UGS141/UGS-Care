const express = require('express');
const router = express.Router();

// TODO: replace with real controllers when available
router.get('/', (req, res) => res.json({ ok: true, service: 'patient', message: 'patient route root' }));
router.get('/health', (req, res) => res.json({ ok: true, service: 'patient', status: 'healthy' }));

module.exports = router;
