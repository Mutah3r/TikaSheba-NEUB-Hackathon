const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Authority = require('../models/authority');

async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email, password are required' });
    }
    const existing = await Authority.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Authority with this email already exists' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const created = await Authority.create({ name, email, password: hashed });
    return res.status(201).json({ id: created._id, name: created.name, email: created.email });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to register authority' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }
    const found = await Authority.findOne({ email });
    if (!found) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const ok = await bcrypt.compare(password, found.password);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: 'JWT secret not configured' });
    }
    const token = jwt.sign({ sub: found._id.toString(), role: 'authority', email: found.email }, secret, { expiresIn: '7d' });
    return res.json({ token });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to login' });
  }
}

module.exports = { register, login };