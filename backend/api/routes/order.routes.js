const express = require("express");
const router = express.Router();

router.get("/", (req, res) => res.json({ ok: true, service: "order.routes", message: "order.routes route root" }));
router.get("/health", (req, res) => res.json({ ok: true, service: "order.routes", status: "healthy" }));

module.exports = router;
