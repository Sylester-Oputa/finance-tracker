const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  listSessions,
  revokeSession,
  revokeAllSessions,
} = require('../controllers/sessionController');

const router = express.Router();

// List active sessions
router.get('/list', protect, listSessions);
// Revoke (logout) a specific session
router.post('/revoke', protect, revokeSession);
// Logout from all devices
router.post('/revoke-all', protect, revokeAllSessions);

module.exports = router;
