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

module.exports = router;