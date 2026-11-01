const express = require('express');
const router = express.Router();
const conn = require('../controllers/connectionController');
const { protect } = require('../middleware/auth');

// Note: specific routes MUST come before /:id routes to avoid conflicts
router.post('/request', protect, conn.sendRequest);
router.get('/pending', protect, conn.getPendingRequests);
router.get('/status/:otherId', protect, conn.getConnectionStatus);
router.get('/mutual/:otherId', protect, conn.getMutualConnections);
router.get('/', protect, conn.getMyConnections);
router.post('/:id/accept', protect, conn.acceptRequest);
router.post('/:id/reject', protect, conn.rejectRequest);
router.delete('/:id', protect, conn.removeConnection);

module.exports = router;
