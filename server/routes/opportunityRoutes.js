const express = require('express');
const router = express.Router();
const opp = require('../controllers/opportunityController');
const { protect } = require('../middleware/auth');

router.post('/', protect, opp.create);
router.get('/', protect, opp.getAll);
router.get('/:id', protect, opp.getById);
router.put('/:id', protect, opp.update);
router.delete('/:id', protect, opp.remove);
router.post('/:id/interest', protect, opp.expressInterest);

module.exports = router;
