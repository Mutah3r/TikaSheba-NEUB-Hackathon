const express = require('express');
const controller = require('../controllers/citizen');

const router = express.Router();

// Start registration: save citizen details and send OTP
router.post('/register', controller.register);

// Verify OTP to complete registration and auto-login
router.post('/verify', controller.verify);

// Login via OTP: request and verify
router.post('/login/request', controller.loginRequest);
router.post('/login/verify', controller.loginVerify);

module.exports = router;