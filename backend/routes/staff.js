const express = require('express');
const controller = require('../controllers/staff');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

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

/**
 * @swagger
 * /api/staff/{staff_id}/vaccines:
 *   put:
 *     summary: Assign or update staff vaccine list (centre only)
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: staff_id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [centre_vaccine_ids]
 *             properties:
 *               centre_vaccine_ids:
 *                 type: array
 *                 items: { type: string }
 *     responses:
 *       200:
 *         description: Staff vaccine list updated
 *       400:
 *         description: Bad request
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
router.put('/:staff_id/vaccines', authenticateToken, authorizeRoles('vacc_centre'), controller.assignVaccines);

/**
 * @swagger
 * /api/staff/me/vaccines:
 *   get:
 *     summary: Get own assigned vaccines (staff)
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Vaccine list
 *       403:
 *         description: Forbidden
 */
router.get('/me/vaccines', authenticateToken, authorizeRoles('staff'), controller.getMyVaccineList);

/**
 * @swagger
 * /api/staff/log:
 *   post:
 *     summary: Create staff vaccine log (staff)
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [centre_vaccine_id, date]
 *             properties:
 *               centre_vaccine_id: { type: string }
 *               date: { type: string, format: date-time }
 *               dose_used: { type: number }
 *               dose_wasted: { type: number }
 *     responses:
 *       201:
 *         description: Log created
 *       400:
 *         description: Bad request
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
router.post('/log', authenticateToken, authorizeRoles('staff'), controller.createLog);

/**
 * @swagger
 * /api/staff/{staff_id}/efficiency:
 *   get:
 *     summary: Get staff efficiency (centre only)
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: staff_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Efficiency summary with per-vaccine totals and people served
 *       400:
 *         description: Bad request
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
router.get('/:staff_id/efficiency', authenticateToken, authorizeRoles('vacc_centre'), controller.getEfficiency);

/**
 * @swagger
 * /api/staff/centre_vaccine/{centre_vaccine_id}/daily:
 *   get:
 *     summary: Aggregate daily dose used and wasted for a centre vaccine across all staff
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: centre_vaccine_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Daily totals for dose used and wasted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 centre_vaccine_id: { type: string }
 *                 centre_id: { type: string }
 *                 vaccine_name: { type: string }
 *                 daily:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date: { type: string }
 *                       total_dose_used: { type: number }
 *                       total_dose_wasted: { type: number }
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
router.get('/centre_vaccine/:centre_vaccine_id/daily', authenticateToken, authorizeRoles('vacc_centre', 'authority'), controller.getDailyUsageByCentreVaccine);

module.exports = router;