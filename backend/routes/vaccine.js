const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const controller = require('../controllers/vaccine');

const router = express.Router();

/**
 * @swagger
 * /api/vaccine:
 *   post:
 *     summary: Add a new vaccine (authority only)
 *     tags: [Vaccine]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *     responses:
 *       201:
 *         description: Vaccine created
 *       400:
 *         description: Missing required fields
 *       403:
 *         description: Forbidden
 *       409:
 *         description: Conflict
 */
router.post('/', authenticateToken, authorizeRoles('authority'), controller.addVaccine);

/**
 * @swagger
 * /api/vaccine:
 *   get:
 *     summary: Get all vaccines (authority only)
 *     tags: [Vaccine]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of vaccines
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: string }
 *                   name: { type: string }
 *                   description: { type: string }
 *       403:
 *         description: Forbidden
 */
router.get('/', authenticateToken, authorizeRoles('authority'), controller.listVaccines);

/**
 * @swagger
 * /api/vaccine/{id}:
 *   put:
 *     summary: Update vaccine (authority only)
 *     tags: [Vaccine]
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
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *     responses:
 *       200:
 *         description: Vaccine updated
 *       400:
 *         description: Bad request
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
router.put('/:id', authenticateToken, authorizeRoles('authority'), controller.updateVaccine);

/**
 * @swagger
 * /api/vaccine/{id}:
 *   delete:
 *     summary: Delete vaccine (authority only)
 *     tags: [Vaccine]
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
 *         description: Vaccine deleted
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
router.delete('/:id', authenticateToken, authorizeRoles('authority'), controller.deleteVaccine);

/**
 * @swagger
 * /api/vaccine/log:
 *   post:
 *     summary: Create vaccine log (staff only)
 *     tags: [Vaccine Log]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [vaccine_id, vaccine_name, citizen_id]
 *             properties:
 *               vaccine_id: { type: string }
 *               vaccine_name: { type: string }
 *               citizen_id: { type: string }
 *               date: { type: string, format: date-time }
 *     responses:
 *       201:
 *         description: Log created
 *       400:
 *         description: Bad request
 *       403:
 *         description: Forbidden
 */
router.post('/log', authenticateToken, authorizeRoles('staff'), controller.createVaccineLog);

/**
 * @swagger
 * /api/vaccine/log/centre/{centre_id}:
 *   get:
 *     summary: Get logs by centre id (authority or centre)
 *     tags: [Vaccine Log]
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
 *         description: List of logs
 *       403:
 *         description: Forbidden
 */
router.get('/log/centre/:centre_id', authenticateToken, authorizeRoles('authority', 'vacc_centre'), controller.getLogsByCentre);

/**
 * @swagger
 * /api/vaccine/log/staff/{staff_id}:
 *   get:
 *     summary: Get logs by staff id (staff/authority/centre)
 *     tags: [Vaccine Log]
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
 *         description: List of logs
 *       403:
 *         description: Forbidden
 */
router.get('/log/staff/:staff_id', authenticateToken, authorizeRoles('staff', 'authority', 'vacc_centre'), controller.getLogsByStaff);

/**
 * @swagger
 * /api/vaccine/log/citizen/{citizen_id}:
 *   get:
 *     summary: Get logs by citizen id (citizen/authority/centre)
 *     tags: [Vaccine Log]
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
 *         description: List of logs
 *       403:
 *         description: Forbidden
 */
router.get('/log/citizen/:citizen_id', authenticateToken, authorizeRoles('citizen','staff', 'authority', 'vacc_centre'), controller.getLogsByCitizen);

/**
 * @swagger
 * /api/vaccine/log/reg/{reg_no}:
 *   get:
 *     summary: Get logs by citizen registration id (citizen/staff/authority/centre)
 *     tags: [Vaccine Log]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reg_no
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Logs with citizen info
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Citizen not found
 */
router.get('/log/reg/:reg_no', authenticateToken, authorizeRoles('citizen','staff', 'authority', 'vacc_centre'), controller.getLogsByRegNo);

// Centre Overview (details and last-week metrics)
router.get('/centre/:centre_id/overview', authenticateToken, authorizeRoles('authority', 'vacc_centre', 'staff'), controller.getCentreOverview);

module.exports = router;