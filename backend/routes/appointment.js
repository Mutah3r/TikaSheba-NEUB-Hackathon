const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const controller = require('../controllers/appointment');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Appointment
 *   description: Appointment management for citizens and centres
 */

/**
 * @swagger
 * /api/appointment:
 *   post:
 *     summary: Create appointment (citizen only)
 *     tags: [Appointment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [citizen_id, vaccine_id, vaccine_name, center_id, date, time]
 *             properties:
 *               citizen_id: { type: string }
 *               vaccine_id: { type: string }
 *               vaccine_name: { type: string }
 *               center_id: { type: string }
 *               date: { type: string, format: date-time }
 *               time: { type: string }
 *     responses:
 *       201:
 *         description: Appointment created with QR URL
 *       400:
 *         description: Bad request
 *       403:
 *         description: Forbidden
 */
router.post('/', authenticateToken, authorizeRoles('citizen'), controller.createAppointment);

/**
 * @swagger
 * /api/appointment/citizen/{citizen_id}:
 *   get:
 *     summary: Get appointments by citizen id
 *     tags: [Appointment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: citizen_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of appointments
 *       403:
 *         description: Forbidden
 */
router.get('/citizen/:citizen_id', authenticateToken, authorizeRoles('citizen', 'authority', 'vacc_centre'), controller.getAppointmentsByCitizen);

/**
 * @swagger
 * /api/appointment/citizen/{citizen_id}/status/{status}:
 *   get:
 *     summary: Get appointments by citizen id and status
 *     tags: [Appointment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: citizen_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [requested, scheduled, done, cancelled, missed]
 *     responses:
 *       200:
 *         description: List of appointments for status
 *       403:
 *         description: Forbidden
 */
router.get('/citizen/:citizen_id/status/:status', authenticateToken, authorizeRoles('citizen', 'authority', 'vacc_centre'), controller.getAppointmentsByCitizenAndStatus);

/**
 * @swagger
 * /api/appointment/{id}/cancel:
 *   put:
 *     summary: Cancel appointment (citizen only)
 *     tags: [Appointment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Appointment cancelled
 *       400:
 *         description: Bad request
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
router.put('/:id/cancel', authenticateToken, authorizeRoles('citizen'), controller.cancelAppointment);

/**
 * @swagger
 * /api/appointment/centre/{centre_id}:
 *   get:
 *     summary: Get appointments by centre id (centre/authority)
 *     tags: [Appointment]
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
 *         description: List of appointments
 *       403:
 *         description: Forbidden
 */
router.get('/centre/:centre_id', authenticateToken, authorizeRoles('vacc_centre', 'authority', 'staff'), controller.getAppointmentsByCentre);

/**
 * @swagger
 * /api/appointment/centre/{centre_id}/status/{status}:
 *   get:
 *     summary: Get appointments by centre id and status (centre/authority)
 *     tags: [Appointment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: centre_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [requested, scheduled, done, cancelled, missed]
 *     responses:
 *       200:
 *         description: List of appointments for status
 *       403:
 *         description: Forbidden
 */
router.get('/centre/:centre_id/status/:status', authenticateToken, authorizeRoles('vacc_centre', 'authority', 'staff'), controller.getAppointmentsByCentreAndStatus);

/**
 * @swagger
 * /api/appointment/centre/{centre_id}/status/{status}/time/{time}:
 *   get:
 *     summary: Get appointments by centre id, status and time (centre/authority)
 *     tags: [Appointment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: centre_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [requested, scheduled, done, cancelled, missed]
 *       - in: path
 *         name: time
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of appointments for status and time
 *       403:
 *         description: Forbidden
 */
router.get('/centre/:centre_id/status/:status/time/:time', authenticateToken, authorizeRoles('vacc_centre', 'authority', 'staff'), controller.getAppointmentsByCentreStatusAndTime);

/**
 * @swagger
 * /api/appointment/centre/{centre_id}/status/scheduled/date/today:
 *   get:
 *     summary: Get today's scheduled appointments by centre id (centre/authority)
 *     tags: [Appointment]
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
 *         description: List of today's scheduled appointments
 *       403:
 *         description: Forbidden
 */
router.get('/centre/:centre_id/status/scheduled/date/today', authenticateToken, authorizeRoles('vacc_centre', 'authority', 'staff'), controller.getTodaysScheduledByCentre);

/**
 * @swagger
 * /api/appointment/centre/{centre_id}/scheduled/next-14-days:
 *   get:
 *     summary: Get scheduled appointment counts per day for the next 14 days
 *     tags: [Appointment]
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
 *         description: Daily counts for the next 14 days
 *       403:
 *         description: Forbidden
 */
router.get('/centre/:centre_id/scheduled/next-14-days', authenticateToken, authorizeRoles('vacc_centre', 'authority', 'staff'), controller.getScheduledCountsByCentreDateRange);

/**
 * @swagger
 * /api/appointment/centre/{centre_id}/status/scheduled/date-range:
 *   get:
 *     summary: Get scheduled appointment counts per day for a date range
 *     tags: [Appointment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: centre_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: start
 *         schema:
 *           type: string
 *           example: 2025-01-01
 *       - in: query
 *         name: end
 *         schema:
 *           type: string
 *           example: 2025-01-14
 *     responses:
 *       200:
 *         description: Daily counts across the range
 *       403:
 *         description: Forbidden
 */
router.get('/centre/:centre_id/status/scheduled/date-range', authenticateToken, authorizeRoles('vacc_centre', 'authority', 'staff'), controller.getScheduledCountsByCentreDateRange);

/**
 * @swagger
 * /api/appointment/{id}/centre/status:
 *   put:
 *     summary: Update appointment status to scheduled or missed (centre/staff)
 *     tags: [Appointment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [scheduled, missed]
 *     responses:
 *       200:
 *         description: Status updated
 *       400:
 *         description: Bad request
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
router.put('/:id/centre/status', authenticateToken, authorizeRoles('vacc_centre', 'staff'), controller.centreUpdateStatus);

/**
 * @swagger
 * /api/appointment/done:
 *   put:
 *     summary: Mark appointment done via QR or appointment id (centre/staff)
 *     tags: [Appointment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               appointment_id: { type: string }
 *               qr_text: { type: string }
 *     responses:
 *       200:
 *         description: Appointment marked done
 *       400:
 *         description: Bad request
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
router.put('/done', authenticateToken, authorizeRoles('vacc_centre', 'staff'), controller.markDone);

module.exports = router;