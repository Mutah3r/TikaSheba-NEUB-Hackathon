const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const controller = require('../controllers/notification');

const router = express.Router();

/**
 * @swagger
 * /api/notification:
 *   get:
 *     summary: List notifications (authority only)
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by notification type
 *       - in: query
 *         name: centre_id
 *         schema:
 *           type: string
 *         description: Filter by vaccination centre id
 *       - in: query
 *         name: since
 *         schema:
 *           type: string
 *           format: date-time
 *         description: ISO date to filter notifications created since
 *     responses:
 *       200:
 *         description: List of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: string }
 *                   type: { type: string }
 *                   centre_id: { type: string }
 *                   centre_vaccine_id: { type: string }
 *                   requested_stock_amount: { type: number }
 *                   delivered_stock_amount: { type: number }
 *                   subject: { type: string }
 *                   message: { type: string }
 *                   recipients:
 *                     type: array
 *                     items: { type: string }
 *                   created_at: { type: string, format: date-time }
 *       403:
 *         description: Forbidden
 */
router.get('/', authenticateToken, authorizeRoles('authority'), controller.listForAuthority);

module.exports = router;