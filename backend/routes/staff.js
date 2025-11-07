const express = require('express');
const controller = require('../controllers/staff');

const router = express.Router();

// Staff login using vacc centre id and staff id
router.post('/login', controller.login);

module.exports = router;