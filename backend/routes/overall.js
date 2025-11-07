const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const controller = require('../controllers/overall');

/**
 * @swagger
 * /api/global/user:
 *   get:
 *     summary: Get current user (id, name, role)
 *     tags: [Global]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 role:
 *                   type: string
 *                   enum: [citizen, authority, vacc_centre, staff]
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get('/user', authenticateToken, controller.getUser);

module.exports = router;