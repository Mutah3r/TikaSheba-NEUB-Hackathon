const jwt = require('jsonwebtoken');
const Citizen = require('../models/citizen');
const { generateOtp } = require('../utils/otp');
const { sendSms } = require('../utils/sms');

async function register(req, res) {
  try {
    const { name, reg_no, NID_no, Birth_Certificate_no, NID_or_Birth, gender, DOB, phone_number } = req.body;
    if (!name || !reg_no || !DOB || !phone_number || typeof NID_or_Birth !== 'boolean' || !gender) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    console.log(req.body);
    const otp = generateOtp();
    let citizen = await Citizen.findOne({ phone_number });
    if (citizen) {
      citizen.name = name;
      citizen.reg_no = reg_no || citizen.reg_no;
      citizen.NID_no = NID_no || citizen.NID_no;
      citizen.Birth_Certificate_no = Birth_Certificate_no || citizen.Birth_Certificate_no;
      citizen.NID_or_Birth = NID_or_Birth;
      citizen.gender = gender;
      citizen.DOB = new Date(DOB);
      citizen.otp = otp;
      await citizen.save();
    } else {
      citizen = await Citizen.create({ name, reg_no, NID_no, Birth_Certificate_no, NID_or_Birth, gender, DOB: new Date(DOB), phone_number, otp });
    }
    try {
      console.log("Trying to send SMS....");
      await sendSms(phone_number, `Your TikaSheba verification OTP is ${otp}`);
      console.log("SMS sent successfully.");
    } catch (smsErr) {
      if (smsErr.response) {
        console.error('Failed to send SMS: API responded with error', {
          status: smsErr.response.status,
          data: smsErr.response.data,
        });
      } else if (smsErr.request) {
        console.error('Failed to send SMS: No response received from API', smsErr.message);
      } else {
        console.error('Failed to send SMS:', smsErr.message);
      }
      // Even if SMS fails, keep the record so they can request OTP again
    }
    return res.status(200).json({ message: 'OTP sent to phone number' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to start registration' });
  }
}

async function verify(req, res) {
  try {
    const { phone_number, otp } = req.body;
    if (!phone_number || !otp) {
      return res.status(400).json({ message: 'phone_number and otp are required' });
    }
    const citizen = await Citizen.findOne({ phone_number, otp });
    if (!citizen) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    citizen.otp = null;
    await citizen.save();
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: 'JWT secret not configured' });
    }
    const token = jwt.sign({ sub: citizen._id.toString(), role: 'citizen', phone: citizen.phone_number }, secret, { expiresIn: '7d' });
    return res.json({ token, role: 'citizen' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to verify OTP' });
  }
}

async function loginRequest(req, res) {
  try {
    const { phone_number } = req.body;
    if (!phone_number) {
      return res.status(400).json({ message: 'phone_number is required' });
    }
    const citizen = await Citizen.findOne({ phone_number });
    if (!citizen) {
      return res.status(404).json({ message: 'Citizen not found' });
    }
    const otp = generateOtp();
    citizen.otp = otp;
    await citizen.save();
    try {
      await sendSms(phone_number, `Your TikaSheba login OTP is ${otp}`);
      console.log('Login OTP SMS sent successfully.');
    } catch (smsErr) {
      if (smsErr.response) {
        console.error('Failed to send login OTP SMS: API responded with error', {
          status: smsErr.response.status,
          data: smsErr.response.data,
        });
      } else if (smsErr.request) {
        console.error('Failed to send login OTP SMS: No response received from API', smsErr.message);
      } else {
        console.error('Failed to send login OTP SMS:', smsErr.message);
      }
    }
    return res.status(200).json({ message: 'OTP sent to phone number' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to send login OTP' });
  }
}

async function loginVerify(req, res) {
  try {
    const { phone_number, otp } = req.body;
    if (!phone_number || !otp) {
      return res.status(400).json({ message: 'phone_number and otp are required' });
    }
    const citizen = await Citizen.findOne({ phone_number, otp });
    if (!citizen) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    citizen.otp = null;
    await citizen.save();
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: 'JWT secret not configured' });
    }
    const token = jwt.sign({ sub: citizen._id.toString(), role: 'citizen', phone: citizen.phone_number }, secret, { expiresIn: '7d' });
    return res.json({ token });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to verify login OTP' });
  }
}

module.exports = { register, verify, loginRequest, loginVerify };