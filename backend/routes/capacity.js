const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const controller = require('../controllers/capacity');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Capacity
 *   description: Vaccination centre capacity and scheduling
 */

/**
 * @swagger
 * /api/capacity:
 *   post:
 *     summary: Add capacity for a vaccination centre (authority or own centre)
 *     tags: [Capacity]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               centre_id: { type: string }
 *               capacity: { type: number }
 *             required: [capacity]
 *     responses:
 *       201:
 *         description: Capacity added
 *       400:
 *         description: Bad request
 *       403:
 *         description: Forbidden
 *       409:
 *         description: Capacity already exists
 */
router.post('/', authenticateToken, authorizeRoles('vacc_centre', 'authority'), controller.addCapacity);

/**
 * @swagger
 * /api/capacity/{centre_id}:
 *   put:
 *     summary: Update capacity for a vaccination centre (authority or own centre)
 *     tags: [Capacity]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: centre_id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               capacity: { type: number }
 *             required: [capacity]
 *     responses:
 *       200:
 *         description: Capacity updated
 *       201:
 *         description: Capacity created (if not exists)
 *       400:
 *         description: Bad request
 *       403:
 *         description: Forbidden
 */
router.put('/:centre_id', authenticateToken, authorizeRoles('vacc_centre', 'authority'), controller.updateCapacity);

/**
 * @swagger
 * /api/capacity/{centre_id}:
 *   get:
 *     summary: Get capacity by vaccination centre id
 *     tags: [Capacity]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: centre_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Capacity info
 *       404:
 *         description: Capacity not set
 */
router.get('/:centre_id', authenticateToken, authorizeRoles('vacc_centre', 'authority', 'staff', 'citizen'), controller.getCapacityByCentre);

/**
 * @swagger
 * /api/capacity/schedule/centre/{centre_id}/next30:
 *   get:
 *     summary: Get next 30 days schedule counts (scheduled appointments per day)
 *     tags: [Capacity]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: centre_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Array of { date, scheduled_count }
 *       403:
 *         description: Forbidden
 */
router.get('/schedule/centre/:centre_id/next30', authenticateToken, authorizeRoles('vacc_centre', 'authority', 'staff'), controller.getCentreScheduleNext30);

/**
 * @swagger
 * /api/capacity/available/centre/{centre_id}/next30:
 *   get:
 *     summary: Citizen: get dates in next 30 days where scheduled count is less than capacity
 *     tags: [Capacity]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: centre_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Array of { date, available }
 *       403:
 *         description: Forbidden
 */
router.get('/available/centre/:centre_id/next30', authenticateToken, authorizeRoles('citizen'), controller.getAvailableDatesNext30);

module.exports = router;