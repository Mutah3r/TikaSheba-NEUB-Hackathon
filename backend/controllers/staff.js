const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const VaccCentre = require('../models/vacc_centre');

async function login(req, res) {
  try {
    const { vc_id, id, password } = req.body;
    if (!vc_id || !id || !password) {
      return res.status(400).json({ message: 'vc_id, id, password are required' });
    }
    const centre = await VaccCentre.findOne({ vc_id });
    if (!centre) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const staff = centre.staffs.find((s) => s.id === id);
    if (!staff) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const ok = await bcrypt.compare(password, staff.password);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: 'JWT secret not configured' });
    }
    const token = jwt.sign({ role: 'staff', vc_id: centre.vc_id, staff_id: staff.id }, secret, { expiresIn: '7d' });
    return res.json({ token, role: 'staff' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to login staff' });
  }
}

module.exports = { login };