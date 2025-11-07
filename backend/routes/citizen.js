const express = require('express');
const controller = require('../controllers/citizen');

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