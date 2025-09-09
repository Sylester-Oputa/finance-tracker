const express = require("express");
const prisma = require("../config/db");

const router = express.Router();

// Simple health check: verifies required env flags (without leaking values) and DB connectivity
router.get("/", async (req, res) => {
  const env = {
    jwtSecret: Boolean(process.env.JWT_SECRET),
    dbUrl: Boolean(process.env.DATABASE_URL),
    frontendUrl: Boolean(process.env.FRONTEND_URL),
    smtpConfigured: Boolean(
      process.env.SMTP_HOST &&
        process.env.SMTP_PORT &&
        process.env.SMTP_USER &&
        process.env.SMTP_PASS &&
        process.env.EMAIL_FROM
    ),
  };

  let db = { ok: true };
  try {
    // Minimal DB ping
    await prisma.$queryRaw`SELECT 1`;
  } catch (e) {
    db = { ok: false, error: e.message };
  }

  res.json({ status: "ok", env, db, timestamp: new Date().toISOString() });
});

module.exports = router;
