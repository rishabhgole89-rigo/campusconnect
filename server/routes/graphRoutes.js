const express = require('express');
const router = express.Router();
const graphCtrl = require('../controllers/graphController');
const { protect } = require('../middleware/auth');

router.get('/network/:userId', protect, graphCtrl.getEgoNetwork);
router.get('/shortest-path/:source/:target', protect, graphCtrl.shortestPath);
router.get('/communities', protect, graphCtrl.getCommunities);
router.get('/stats', protect, graphCtrl.getNetworkStats);

module.exports = router;
