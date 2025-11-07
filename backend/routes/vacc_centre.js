const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const controller = require('../controllers/vacc_centre');

const router = express.Router();

// Authority can add vacc centres
router.post('/register', authenticateToken, authorizeRoles('authority'), controller.register);

// Vacc centre login
router.post('/login', controller.login);

// Vacc centre adds staff
router.post('/staff', authenticateToken, authorizeRoles('vacc_centre'), controller.addStaff);

module.exports = router;