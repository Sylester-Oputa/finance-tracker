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
  let migrations = { appliedCount: null, latest: null };
  let schema = { userTableExists: null };
  try {
    // Minimal DB ping
    await prisma.$queryRaw`SELECT 1`;
    // Check prisma migration history table
    try {
      const rows = await prisma.$queryRawUnsafe(
        'SELECT migration_name, finished_at FROM "_prisma_migrations" ORDER BY finished_at DESC NULLS LAST LIMIT 1'
      );
      const countRes = await prisma.$queryRawUnsafe(
        'SELECT COUNT(*)::int as count FROM "_prisma_migrations"'
      );
      migrations = {
        appliedCount: Array.isArray(countRes) && countRes[0] ? countRes[0].count : 0,
        latest: Array.isArray(rows) && rows[0] ? rows[0].migration_name : null,
      };
    } catch (e) {
      migrations = { appliedCount: 0, latest: null, error: e.message };
    }
    // Check if the User table exists
    try {
      await prisma.$queryRawUnsafe('SELECT 1 FROM "User" LIMIT 1');
      schema.userTableExists = true;
    } catch (e) {
      schema.userTableExists = false;
    }
  } catch (e) {
    db = { ok: false, error: e.message };
  }

  res.json({ status: "ok", env, db, migrations, schema, timestamp: new Date().toISOString() });
});

module.exports = router;
