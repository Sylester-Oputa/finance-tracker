const prisma = require('../config/db');

// Persist audit logs to the database to support serverless (read-only filesystem)
async function logAudit(action, userId, details = {}) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        userId: userId || null,
        details,
      },
    });
  } catch (err) {
    // Fallback to console to avoid breaking main flow
    console.error('Audit log insert failed:', err.message, {
      action,
      userId,
    });
  }
}

module.exports = { logAudit };
