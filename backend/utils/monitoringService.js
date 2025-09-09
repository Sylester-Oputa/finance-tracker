const prisma = require('../config/db');
const { sendNotificationEmail } = require('./notificationService');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

// Check for suspicious failed logins in the last hour
async function checkFailedLogins(userId) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const failedLogins = await prisma.auditLog.count({
    where: {
      userId,
      action: 'FAILED_LOGIN',
      createdAt: { gte: oneHourAgo },
    },
  });
  if (failedLogins >= 5) {
    await sendNotificationEmail(
      ADMIN_EMAIL,
      'Security Alert: Multiple Failed Logins',
      `<p>User ID: ${userId} has ${failedLogins} failed login attempts in the last hour.</p>`
    );
  }
}

// Check for suspicious password reset requests in the last hour
async function checkPasswordResets(userId) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const resetRequests = await prisma.auditLog.count({
    where: {
      userId,
      action: 'PASSWORD_RESET_REQUEST',
      createdAt: { gte: oneHourAgo },
    },
  });
  if (resetRequests >= 3) {
    await sendNotificationEmail(
      ADMIN_EMAIL,
      'Security Alert: Multiple Password Reset Requests',
      `<p>User ID: ${userId} has ${resetRequests} password reset requests in the last hour.</p>`
    );
  }
}

module.exports = { checkFailedLogins, checkPasswordResets };
