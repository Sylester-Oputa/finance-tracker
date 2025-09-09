const cron = require('node-cron');
const cleanupSessions = require('./sessionCleanup');
const prisma = require('../config/db');
const nodemailer = require('nodemailer');

// Helper to send email (copy your transporter setup here)
async function sendEmail(to, subject, html) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Finance Tracker" <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    html,
  });
}

// 1. Send warning email on 5th day of inactivity
cron.schedule('0 0 * * *', async () => {
  // Runs every day at midnight
  const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Find users who haven't logged in for 5-7 days and are still ACTIVE
  const users = await prisma.user.findMany({
    where: {
      status: 'ACTIVE',
      lastLoginAt: { lt: fiveDaysAgo, gt: sevenDaysAgo },
      deletedAt: null,
    },
  });

  for (const user of users) {
    await sendEmail(
      user.email,
      'Account Inactivity Warning',
      `<p>Your account will be marked inactive soon due to inactivity. Please log in to keep your account active.</p>`
    );
  }
});

// 2. Set account to INACTIVE after 7 days of no login
cron.schedule('10 0 * * *', async () => {
  // Runs every day at 00:10am
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  await prisma.user.updateMany({
    where: {
      status: 'ACTIVE',
      lastLoginAt: { lt: sevenDaysAgo },
      deletedAt: null,
    },
    data: { status: 'INACTIVE' },
  });
});

// 3. Cleanup expired/revoked sessions every day at 00:20am
cron.schedule('20 0 * * *', async () => {
  await cleanupSessions();
});

// 4. Generate transactions from recurring records
cron.schedule('20 0 * * *', async () => {
  // Runs every day at 00:20am
  const now = new Date();
  const dueRecurring = await prisma.recurringTransaction.findMany({
    where: {
      active: true,
      nextRunDate: { lte: now },
    },
  });

  for (const rec of dueRecurring) {
    if (rec.type === 'income') {
      await prisma.income.create({
        data: {
          userId: rec.userId,
          source: rec.source || rec.category,
          amount: rec.amount,
          date: now,
          icon: '', // You can set a default or use rec.category
        },
      });
    } else if (rec.type === 'expense') {
      await prisma.expense.create({
        data: {
          userId: rec.userId,
          category: rec.category,
          amount: rec.amount,
          date: now,
          icon: '', // You can set a default or use rec.category
        },
      });
    }

    // Calculate nextRunDate
    let next = new Date(rec.nextRunDate);
    if (rec.frequency === 'monthly') {
      next.setMonth(next.getMonth() + 1);
    } else if (rec.frequency === 'weekly') {
      next.setDate(next.getDate() + 7);
    } else if (rec.frequency === 'daily') {
      next.setDate(next.getDate() + 1);
    }

    await prisma.recurringTransaction.update({
      where: { id: rec.id },
      data: { nextRunDate: next },
    });
  }
});

// 3. Delete account 12 hours after INACTIVE status, with final email
cron.schedule('0 */1 * * *', async () => {
  // Runs every hour
  const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
  const users = await prisma.user.findMany({
    where: {
      status: 'INACTIVE',
      updatedAt: { lt: twelveHoursAgo },
      deletedAt: null,
    },
  });

  for (const user of users) {
    await sendEmail(
      user.email,
      'Account Deleted',
      `<p>Your account has been deleted due to inactivity.</p>`
    );
    await prisma.user.update({
      where: { id: user.id },
      data: { deletedAt: new Date(), status: 'DELETED' },
    });
  }
});

module.exports = {};
