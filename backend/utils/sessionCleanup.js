const prisma = require('../config/db');

// Delete expired or revoked sessions (run via cron)
async function cleanupSessions() {
  const now = new Date();
  const deleted = await prisma.session.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: now } },
        { revoked: true },
      ],
    },
  });
}

if (require.main === module) {
  cleanupSessions().then(() => process.exit(0));
}

module.exports = cleanupSessions;
