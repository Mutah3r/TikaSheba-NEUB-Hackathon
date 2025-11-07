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
    return res.json({ token, role: 'citizen' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to verify login OTP' });
  }
}

module.exports = { register, verify, loginRequest, loginVerify };

// NEW FEATURES BELOW

async function updateInfo(req, res) {
  try {
    const user = req.user;
    if (!user || user.role !== 'citizen') {
      return res.status(403).json({ message: 'Forbidden: citizen only' });
    }
    const { name, gender, phone_number } = req.body;
    if (!name && !gender && !phone_number) {
      return res.status(400).json({ message: 'No fields provided to update' });
    }
    const citizen = await Citizen.findById(user.sub);
    if (!citizen) {
      return res.status(404).json({ message: 'Citizen not found' });
    }
    if (name) citizen.name = name;
    if (gender) citizen.gender = gender;
    if (phone_number) citizen.phone_number = phone_number;
    await citizen.save();
    return res.json({ message: 'Profile updated', citizen: { id: citizen._id.toString(), name: citizen.name, gender: citizen.gender, phone_number: citizen.phone_number } });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update profile' });
  }
}

function parseCitizenIdFromQr(text) {
  if (!text || typeof text !== 'string') return null;
  // Try JSON payload
  try {
    const obj = JSON.parse(text);
    if (obj && (obj.citizen_id || obj.id || obj.sub)) {
      return obj.citizen_id || obj.id || obj.sub;
    }
  } catch (_) {}
  // Try simple schemes
  const m1 = text.match(/^citizen:(.+)$/i);
  if (m1) return m1[1];
  const m2 = text.match(/citizen_id=([A-Za-z0-9]+)/i);
  if (m2) return m2[1];
  return null;
}

async function scanQrAndSendOtp(req, res) {
  try {
    const { qr_text, citizen_id } = req.body;
    const id = citizen_id || parseCitizenIdFromQr(qr_text);
    if (!id) {
      return res.status(400).json({ message: 'citizen_id or qr_text required' });
    }
    const citizen = await Citizen.findById(id);
    if (!citizen) {
      return res.status(404).json({ message: 'Citizen not found' });
    }
    const message = 'Your vaccine taken data are scanned from a device';
    return res.json({
      message,
      citizen: { id: citizen._id.toString(), name: citizen.name },
      vaccine_taken: citizen.vaccine_taken || [],
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to process QR scan' });
  }
}

async function getVaccineHistoryFormatted(req, res) {
  try {
    const requester = req.user;
    if (!requester || !['citizen', 'staff'].includes(requester.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'citizen id required' });
    }
    if (requester.role === 'citizen' && requester.sub !== id) {
      return res.status(403).json({ message: 'Access denied to other citizen data' });
    }
    const citizen = await Citizen.findById(id);
    if (!citizen) {
      return res.status(404).json({ message: 'Citizen not found' });
    }
    const summaryMap = new Map();
    for (const entry of (citizen.vaccine_taken || [])) {
      const key = entry.vaccine_id || entry.vaccine_name;
      if (!summaryMap.has(key)) {
        summaryMap.set(key, {
          vaccine_name: entry.vaccine_name,
          dose_count: 0,
          last_date: null,
        });
      }
      const agg = summaryMap.get(key);
      agg.dose_count += 1;
      const ts = entry.time_stamp ? new Date(entry.time_stamp) : null;
      if (!agg.last_date || (ts && ts > agg.last_date)) {
        agg.last_date = ts;
      }
    }
    const summary = Array.from(summaryMap.values()).map(s => ({
      vaccine_name: s.vaccine_name,
      dose_count: s.dose_count,
      last_date: s.last_date,
    }));
    return res.json({ citizen: { id: citizen._id.toString(), name: citizen.name }, summary });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to get vaccine history' });
  }
}

module.exports.updateInfo = updateInfo;
module.exports.scanQrAndSendOtp = scanQrAndSendOtp;
module.exports.getVaccineHistoryFormatted = getVaccineHistoryFormatted;