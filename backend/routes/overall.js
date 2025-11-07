const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
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

/**
 * @swagger
 * /api/global/ocr/vaccine-card:
 *   post:
 *     summary: OCR vaccination card image using Gemini and update citizen record
 *     tags: [Global]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [image_base64]
 *             properties:
 *               image_base64: { type: string, description: "Base64-encoded image data" }
 *               mimeType: { type: string, description: "Image MIME type, e.g., image/jpeg" }
 *     responses:
 *       200:
 *         description: OCR result and update status
 *       400:
 *         description: Bad request or parse error
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Citizen not found
 */
router.post('/ocr/vaccine-card', controller.ocrVaccinationCard);

module.exports = router;