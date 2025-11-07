const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const controller = require('../controllers/graph');

/**
 * @swagger
 * tags:
 *   name: Graph
 *   description: Aggregated metrics and charts
 */

/**
 * @swagger
 * /api/graph/centre/served/last-7-days:
 *   get:
 *     summary: Get served (done) appointment counts per day for the last 7 days for current centre user
 *     tags: [Graph]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD); defaults to 6 days before today
 *       - in: query
 *         name: end
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD); defaults to today
 *     responses:
 *       200:
 *         description: Daily served counts for the requested range
 *       400:
 *         description: Missing centre id (vc_id) for user
 *       403:
 *         description: Forbidden
 */
router.get(
  '/centre/served/last-7-days',
  authenticateToken,
  authorizeRoles('vacc_centre', 'staff'),
  controller.getWeeklyServedByCentre
);

module.exports = router;