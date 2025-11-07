const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const controller = require('../controllers/centre_vaccine');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Centre Vaccine
 *   description: Centre vaccine stock and requests management
 */

/**
 * @swagger
 * /api/centre_vaccine:
 *   post:
 *     summary: Add or create centre vaccine (authority only)
 *     tags: [Centre Vaccine]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [centre_id, vaccine_id, vaccine_name]
 *             properties:
 *               centre_id: { type: string }
 *               vaccine_id: { type: string }
 *               vaccine_name: { type: string }
 *     responses:
 *       201:
 *         description: Centre vaccine created
 *       400:
 *         description: Bad request
 *       403:
 *         description: Forbidden
 *       409:
 *         description: Conflict
 */
router.post('/', authenticateToken, authorizeRoles('authority'), controller.addCentreVaccine);

/**
 * @swagger
 * /api/centre_vaccine/bulk:
 *   post:
 *     summary: Bulk add centre vaccines for a centre (authority only)
 *     tags: [Centre Vaccine]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [centre_id, items]
 *             properties:
 *               centre_id: { type: string }
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [vaccine_id, vaccine_name]
 *                   properties:
 *                     vaccine_id: { type: string }
 *                     vaccine_name: { type: string }
 *     responses:
 *       201:
 *         description: Bulk centre vaccines added
 *       400:
 *         description: Bad request
 *       403:
 *         description: Forbidden
 */
router.post('/bulk', authenticateToken, authorizeRoles('authority'), controller.addCentreVaccinesBulk);

/**
 * @swagger
 * /api/centre_vaccine/{id}:
 *   delete:
 *     summary: Delete centre vaccine by id (authority only)
 *     tags: [Centre Vaccine]
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
 *         description: Deleted
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
router.delete('/:id', authenticateToken, authorizeRoles('authority'), controller.deleteCentreVaccine);

/**
 * @swagger
 * /api/centre_vaccine/requested:
 *   get:
 *     summary: Get all requested stock (authority only)
 *     tags: [Centre Vaccine]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of requested centre vaccines
 *       403:
 *         description: Forbidden
 */
router.get('/requested', authenticateToken, authorizeRoles('authority'), controller.getAllRequested);

/**
 * @swagger
 * /api/centre_vaccine/{id}/requested:
 *   get:
 *     summary: Get requested stock by centre vaccine id (authority only)
 *     tags: [Centre Vaccine]
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
 *         description: Requested stock details
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found or not requested
 */
router.get('/:id/requested', authenticateToken, authorizeRoles('authority'), controller.getRequestedById);

/**
 * @swagger
 * /api/centre_vaccine/{id}/status:
 *   put:
 *     summary: Update requested status (authority only)
 *     tags: [Centre Vaccine]
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
 *               status:
 *                 type: string
 *                 enum: [requested, sent]
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
router.put('/:id/status', authenticateToken, authorizeRoles('authority'), controller.updateStatus);

/**
 * @swagger
 * /api/centre_vaccine/{id}/stock:
 *   put:
 *     summary: Update stock (add or decrease) for centre (centre only)
 *     tags: [Centre Vaccine]
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
 *             required: [operation, amount]
 *             properties:
 *               operation:
 *                 type: string
 *                 enum: [add, decrease]
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Stock updated
 *       400:
 *         description: Bad request
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
router.put('/:id/stock', authenticateToken, authorizeRoles('vacc_centre'), controller.updateStock);

/**
 * @swagger
 * /api/centre_vaccine/requests/{status}:
 *   get:
 *     summary: Get all requests by status for own centre (centre only)
 *     tags: [Centre Vaccine]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [requested, sent]
 *     responses:
 *       200:
 *         description: List of centre vaccine entries by status
 *       400:
 *         description: Bad request
 *       403:
 *         description: Forbidden
 */
router.get('/requests/:status', authenticateToken, authorizeRoles('vacc_centre'), controller.getByRequestedStatus);

/**
 * @swagger
 * /api/centre_vaccine/{id}/request:
 *   put:
 *     summary: Submit requested stock amount (centre only)
 *     tags: [Centre Vaccine]
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
 *             required: [requested_stock_amount]
 *             properties:
 *               requested_stock_amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Request submitted
 *       400:
 *         description: Bad request
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
router.put('/:id/request', authenticateToken, authorizeRoles('vacc_centre'), controller.sendRequest);

/**
 * @swagger
 * /api/centre_vaccine/assigned:
 *   get:
 *     summary: Get all vaccines assigned to the current centre (centre only)
 *     tags: [Centre Vaccine]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of assigned centre vaccines
 *       403:
 *         description: Forbidden
 */
router.get('/assigned', authenticateToken, authorizeRoles('vacc_centre'), controller.getAssignedForCentre);

/**
 * @swagger
 * /api/centre_vaccine/assigned/{centre_id}:
 *   get:
 *     summary: Get all vaccines assigned to a centre (authority only)
 *     tags: [Centre Vaccine]
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
 *         description: List of assigned vaccines for the centre
 *       403:
 *         description: Forbidden
 */
router.get('/assigned/:centre_id', authenticateToken, authorizeRoles('authority'), controller.getAssignedForCentreByAuthority);

/**
 * @swagger
 * /api/centre_vaccine/available/{vaccine_id}:
 *   get:
 *     summary: Get all centres with current stock for a vaccine (public)
 *     tags: [Centre Vaccine]
 *     parameters:
 *       - in: path
 *         name: vaccine_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of centres with stock and their details
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   centre:
 *                     type: object
 *                     properties:
 *                       id: { type: string }
 *                       vc_id: { type: string }
 *                       name: { type: string }
 *                       location: { type: string }
 *                       district: { type: string }
 *                       lattitude: { type: number }
 *                       longitude: { type: number }
 *                       staff_count: { type: number }
 *                   stock:
 *                     type: object
 *                     properties:
 *                       centre_vaccine_id: { type: string }
 *                       vaccine_id: { type: string }
 *                       vaccine_name: { type: string }
 *                       current_stock: { type: number }
 *                       total_people: { type: number }
 *                       total_dosed: { type: number }
 *                       total_wasted: { type: number }
 */
router.get('/available/:vaccine_id', controller.getCentresWithStockByVaccine);

module.exports = router;