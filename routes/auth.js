const express = require('express');
const { body } = require('express-validator/check'); // or check method

const authControllers = require('../controllers/auth');

const router = express.Router();

router.post('/signup', [body('password').isLength({ min: 8 }).isAlphanumeric().trim(),
    body('email').isEmail().trim(),
    body('name').isLength({ min: 4 }).trim()
], authControllers.signUp);
router.post('/login', authControllers.login);
router.post('/resetpassword', authControllers.getResetPassword)
router.post('/resetpassword/:token', authControllers.resetPassword);

module.exports = router;