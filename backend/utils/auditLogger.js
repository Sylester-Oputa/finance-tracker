const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, '../logs/audit.log');

function logAudit(action, userId, details = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    action,
    userId,
    details,
  };
  fs.appendFileSync(logFilePath, JSON.stringify(entry) + '\n');
}

module.exports = { logAudit };
