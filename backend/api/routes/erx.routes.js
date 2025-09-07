const express = require("express");
const router = express.Router();

router.get("/", (req, res) => res.json({ ok: true, service: "erx.routes", message: "erx.routes route root" }));
router.get("/health", (req, res) => res.json({ ok: true, service: "erx.routes", status: "healthy" }));

module.exports = router;
