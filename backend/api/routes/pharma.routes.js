const express = require("express");
const router = express.Router();

router.get("/", (req, res) => res.json({ ok: true, service: "pharma.routes", message: "pharma.routes route root" }));
router.get("/health", (req, res) => res.json({ ok: true, service: "pharma.routes", status: "healthy" }));

module.exports = router;
