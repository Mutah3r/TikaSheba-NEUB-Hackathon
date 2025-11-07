const express = require('express');
const controller = require('../controllers/staff');

const router = express.Router();

/**
 * @swagger
 * /api/staff/login:
 *   post:
 *     summary: Staff login using centre ID and staff ID
 *     tags: [Staff]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [vc_id, id, password]
 *             properties:
 *               vc_id: { type: string }
 *               id: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token: { type: string }
 *       400:
 *         description: Bad request
 *       401:
 *         description: Invalid credentials
 */
// Staff login using vacc centre id and staff id
router.post('/login', controller.login);

module.exports = router;