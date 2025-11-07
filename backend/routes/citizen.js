const express = require('express');
const controller = require('../controllers/citizen');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

/**
 * @swagger
 * /api/citizen/register:
 *   post:
 *     summary: Start citizen registration and send OTP
 *     tags: [Citizen]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, reg_no, DOB, NID_or_Birth, gender, phone_number]
 *             properties:
 *               name: { type: string }
 *               reg_no: { type: string }
 *               NID_no: { type: string }
 *               Birth_Certificate_no: { type: string }
 *               NID_or_Birth: { type: boolean }
 *               gender: { type: string }
 *               DOB: { type: string, format: date }
 *               phone_number: { type: string }
 *     responses:
 *       200:
 *         description: OTP sent to phone number
 *       400:
 *         description: Missing required fields
 */
// Start registration: save citizen details and send OTP
router.post('/register', controller.register);

/**
 * @swagger
 * /api/citizen/verify:
 *   post:
 *     summary: Verify OTP to complete registration and auto-login
 *     tags: [Citizen]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone_number, otp]
 *             properties:
 *               phone_number: { type: string }
 *               otp: { type: string }
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
 *         description: Invalid OTP or bad request
 */
// Verify OTP to complete registration and auto-login
router.post('/verify', controller.verify);

/**
 * @swagger
 * /api/citizen/login/request:
 *   post:
 *     summary: Request OTP for citizen login
 *     tags: [Citizen]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone_number]
 *             properties:
 *               phone_number: { type: string }
 *     responses:
 *       200:
 *         description: OTP sent to phone number
 *       404:
 *         description: Citizen not found
 */
// Login via OTP: request and verify
router.post('/login/request', controller.loginRequest);
router.post('/login/verify', controller.loginVerify);

/**
 * @swagger
 * /api/citizen/login/verify:
 *   post:
 *     summary: Verify OTP to login citizen
 *     tags: [Citizen]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone_number, otp]
 *             properties:
 *               phone_number: { type: string }
 *               otp: { type: string }
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
 *         description: Invalid OTP or bad request
 */
module.exports = router;

/**
 * @swagger
 * /api/citizen/me:
 *   put:
 *     summary: Update citizen basic info (name, gender, phone number)
 *     tags: [Citizen]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               gender: { type: string }
 *               phone_number: { type: string }
 *     responses:
 *       200:
 *         description: Profile updated
 *       400:
 *         description: No fields provided to update
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Citizen not found
 */
router.put('/me', authenticateToken, authorizeRoles('citizen'), controller.updateInfo);

/**
 * @swagger
 * /api/citizen/qr/scan:
 *   post:
 *     summary: Scan QR to get vaccine list of a citizen (no OTP)
 *     tags: [Citizen]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               citizen_id: { type: string }
 *               qr_text: { type: string }
 *               staff_name: { type: string, description: "Optional staff name to annotate message" }
 *     responses:
 *       200:
 *         description: Vaccine list returned; message may include staff name
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 citizen:
 *                   type: object
 *                   properties:
 *                     id: { type: string }
 *                     name: { type: string }
 *                 vaccine_taken:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       vaccine_id: { type: string }
 *                       vaccine_name: { type: string }
 *                       time_stamp: { type: string, format: date-time }
 *       400:
 *         description: citizen_id or qr_text required
 *       404:
 *         description: Citizen not found
 */
router.post('/qr/scan', controller.scanQrAndSendOtp);

/**
 * @swagger
 * /api/citizen/{id}/vaccines/history:
 *   get:
 *     summary: Get formatted vaccine history (citizen or staff)
 *     tags: [Citizen]
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
 *         description: Vaccine history summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 citizen:
 *                   type: object
 *                   properties:
 *                     id: { type: string }
 *                     name: { type: string }
 *                 summary:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       vaccine_name: { type: string }
 *                       dose_count: { type: number }
 *                       last_date: { type: string, format: date-time }
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Citizen not found
 */
router.get('/:id/vaccines/history', authenticateToken, authorizeRoles('citizen', 'staff'), controller.getVaccineHistoryFormatted);