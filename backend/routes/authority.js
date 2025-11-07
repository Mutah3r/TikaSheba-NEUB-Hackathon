const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const controller = require('../controllers/authority');

const router = express.Router();

// Only an existing authority can create another authority
router.post('/register', authenticateToken, authorizeRoles('authority'), controller.register);

// Authority login with email/password
router.post('/login', controller.login);

module.exports = router;