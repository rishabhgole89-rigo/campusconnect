const express = require('express');
const router = express.Router();
const graphCtrl = require('../controllers/graphController');
const { protect } = require('../middleware/auth');

router.get('/people', protect, graphCtrl.getPeopleRecommendations);
router.get('/similar', protect, graphCtrl.getSimilarPeople);
router.get('/collaborators', protect, graphCtrl.getCollaboratorRecommendations);

module.exports = router;
