const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const controller = require('../controllers/vacc_centre');

const router = express.Router();

/**
 * @swagger
 * /api/vacc_centre/register:
 *   post:
 *     summary: Register a vaccination centre (authority only)
 *     tags: [VaccCentre]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, location, district, lattitude, longitude, vc_id, password]
 *             properties:
 *               name: { type: string }
 *               location: { type: string }
 *               district: { type: string }
 *               lattitude: { type: number }
 *               longitude: { type: number }
 *               vc_id: { type: string }
 *               password: { type: string }
 *     responses:
 *       201:
 *         description: Centre created
 *       400:
 *         description: Missing required fields
 *       403:
 *         description: Forbidden
 *       409:
 *         description: Conflict
 */
// Authority can add vacc centres
router.post('/register', authenticateToken, authorizeRoles('authority'), controller.register);

/**
 * @swagger
 * /api/vacc_centre/login:
 *   post:
 *     summary: Vaccination centre login
 *     tags: [VaccCentre]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [vc_id, password]
 *             properties:
 *               vc_id: { type: string }
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
// Vacc centre login
router.post('/login', controller.login);

/**
 * @swagger
 * /api/vacc_centre/staff:
 *   post:
 *     summary: Add staff to vaccination centre (centre only)
 *     tags: [VaccCentre]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id, name, password]
 *             properties:
 *               id: { type: string }
 *               name: { type: string }
 *               password: { type: string }
 *     responses:
 *       201:
 *         description: Staff added
 *       400:
 *         description: Missing required fields
 *       403:
 *         description: Forbidden
 *       409:
 *         description: Staff ID already exists
 */
// Vacc centre adds staff
router.post('/staff', authenticateToken, authorizeRoles('vacc_centre'), controller.addStaff);

/**
 * @swagger
 * /api/vacc_centre/{id}:
 *   put:
 *     summary: Update vaccination centre (authority or centre)
 *     tags: [VaccCentre]
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
 *               location: { type: string }
 *               district: { type: string }
 *               lattitude: { type: number }
 *               longitude: { type: number }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Centre updated
 *       400:
 *         description: Bad request
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
router.put('/:id', authenticateToken, authorizeRoles('authority', 'vacc_centre'), controller.updateCentre);

/**
 * @swagger
 * /api/vacc_centre:
 *   get:
 *     summary: Get all vaccination centres (authority only)
 *     tags: [VaccCentre]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of centres
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: string }
 *                   vc_id: { type: string }
 *                   name: { type: string }
 *                   location: { type: string }
 *                   district: { type: string }
 *                   lattitude: { type: number }
 *                   longitude: { type: number }
 *                   staff_count: { type: number }
 *       403:
 *         description: Forbidden
 */
router.get('/', authenticateToken, authorizeRoles('authority'), controller.listCentres);

module.exports = router;