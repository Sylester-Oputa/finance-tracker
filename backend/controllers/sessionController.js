const prisma = require('../config/db');

// List active sessions for the user
exports.listSessions = async (req, res) => {
  try {
    const sessions = await prisma.session.findMany({
      where: {
        userId: req.user.id,
        revoked: false,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        createdAt: true,
        expiresAt: true,
        deviceInfo: true,
        ipAddress: true,
      },
    });
    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching sessions', error: err.message });
  }
};

// Revoke (logout) a specific session
exports.revokeSession = async (req, res) => {
  const { sessionId } = req.body;
  try {
    await prisma.session.update({
      where: { id: sessionId, userId: req.user.id },
      data: { revoked: true },
    });
    res.json({ message: 'Session revoked successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error revoking session', error: err.message });
  }
};

// Logout from all devices
exports.revokeAllSessions = async (req, res) => {
  try {
    await prisma.session.updateMany({
      where: { userId: req.user.id, revoked: false },
      data: { revoked: true },
    });
    res.json({ message: 'All sessions revoked successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error revoking all sessions', error: err.message });
  }
};
