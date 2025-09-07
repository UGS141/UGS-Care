const express = require("express");
const router = express.Router();

router.get("/", (req, res) => res.json({ ok: true, service: "admin.routes", message: "admin.routes route root" }));
router.get("/health", (req, res) => res.json({ ok: true, service: "admin.routes", status: "healthy" }));

module.exports = router;
