const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/', protect, userCtrl.getUsers);
router.get('/:id', protect, userCtrl.getUserById);
router.put('/:id', protect, userCtrl.updateUser);

module.exports = router;
