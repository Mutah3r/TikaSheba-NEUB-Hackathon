const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const VaccCentre = require('../models/vacc_centre');

async function register(req, res) {
  try {
    const { name, location, district, lattitude, longitude, vc_id, password } = req.body;
    if (!name || !location || !district || lattitude === undefined || longitude === undefined || !vc_id || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const existing = await VaccCentre.findOne({ vc_id });
    if (existing) {
      return res.status(409).json({ message: 'vacc_centre with this vc_id already exists' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const created = await VaccCentre.create({ name, location, district, lattitude, longitude, vc_id, password: hashed, staffs: [] });
    return res.status(201).json({ id: created._id, vc_id: created.vc_id });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to register vacc_centre' });
  }
}

async function login(req, res) {
  try {
    const { vc_id, password } = req.body;
    if (!vc_id || !password) {
      return res.status(400).json({ message: 'vc_id and password are required' });
    }
    const centre = await VaccCentre.findOne({ vc_id });
    if (!centre) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const ok = await bcrypt.compare(password, centre.password);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: 'JWT secret not configured' });
    }
    const token = jwt.sign({ sub: centre._id.toString(), role: 'vacc_centre', vc_id: centre.vc_id }, secret, { expiresIn: '7d' });
    return res.json({ token });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to login vacc_centre' });
  }
}

async function addStaff(req, res) {
  try {
    const centreId = req.user?.sub;
    if (!centreId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const { id, name, password } = req.body;
    if (!id || !name || !password) {
      return res.status(400).json({ message: 'id, name, password are required' });
    }
    const centre = await VaccCentre.findById(centreId);
    if (!centre) {
      return res.status(404).json({ message: 'vacc_centre not found' });
    }
    const exists = centre.staffs.find((s) => s.id === id);
    if (exists) {
      return res.status(409).json({ message: 'Staff id already exists in this centre' });
    }
    const hashed = await bcrypt.hash(password, 10);
    centre.staffs.push({ id, name, password: hashed });
    await centre.save();
    return res.status(201).json({ message: 'Staff added' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to add staff' });
  }
}

module.exports = { register, login, addStaff };