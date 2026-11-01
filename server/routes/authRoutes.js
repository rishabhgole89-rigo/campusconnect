const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
const { validate } = require('../middleware/validate');
const { protect } = require('../middleware/auth');

router.post('/register', auth.registerValidators, validate, auth.register);
router.post('/login', auth.loginValidators, validate, auth.login);
router.post('/logout', auth.logout);
router.get('/me', protect, auth.getMe);

module.exports = router;
