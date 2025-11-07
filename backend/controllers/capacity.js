const CenterCapacity = require('../models/center_maximum_capacity');
const Appointment = require('../models/appointments');

// Add capacity for a centre (authority or own centre)
async function addCapacity(req, res) {
  try {
    const role = req.user?.role;
    if (!['vacc_centre', 'authority'].includes(role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    let { centre_id, capacity } = req.body;
    if (role === 'vacc_centre') {
      const vcId = req.user?.vc_id;
      if (!vcId) return res.status(400).json({ message: 'vc_id missing in token' });
      if (centre_id && centre_id !== vcId) {
        return res.status(403).json({ message: 'Forbidden: different centre' });
      }
      centre_id = vcId;
    }
    if (!centre_id || capacity === undefined) {
      return res.status(400).json({ message: 'centre_id and capacity are required' });
    }
    const existing = await CenterCapacity.findOne({ centre_id });
    if (existing) {
      return res.status(409).json({ message: 'Capacity already exists for this centre' });
    }
    const created = await CenterCapacity.create({ centre_id, capacity: Number(capacity) });
    return res.status(201).json({ centre_id: created.centre_id, capacity: created.capacity });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to add capacity' });
  }
}

// Update capacity for a centre (authority or own centre)
async function updateCapacity(req, res) {
  try {
    const role = req.user?.role;
    if (!['vacc_centre', 'authority'].includes(role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const paramCentreId = req.params.centre_id;
    let { capacity } = req.body;
    if (capacity === undefined) {
      return res.status(400).json({ message: 'capacity is required' });
    }
    if (role === 'vacc_centre') {
      const vcId = req.user?.vc_id;
      if (!vcId) return res.status(400).json({ message: 'vc_id missing in token' });
      if (paramCentreId !== vcId) {
        return res.status(403).json({ message: 'Forbidden: different centre' });
      }
    }
    const doc = await CenterCapacity.findOne({ centre_id: paramCentreId });
    if (!doc) {
      // If not exists, create on update
      const created = await CenterCapacity.create({ centre_id: paramCentreId, capacity: Number(capacity) });
      return res.status(201).json({ centre_id: created.centre_id, capacity: created.capacity });
    }
    doc.capacity = Number(capacity);
    await doc.save();
    return res.status(200).json({ centre_id: doc.centre_id, capacity: doc.capacity });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update capacity' });
  }
}

// Get capacity by centre_id (any authenticated role)
async function getCapacityByCentre(req, res) {
  try {
    const { centre_id } = req.params;
    const doc = await CenterCapacity.findOne({ centre_id });
    if (!doc) {
      return res.status(404).json({ message: 'Capacity not set', centre_id });
    }
    return res.status(200).json({ centre_id: doc.centre_id, capacity: doc.capacity });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to get capacity' });
  }
}

// Helper to compute date range and counts
function getDateRangeNext30() {
  const start = new Date();
  start.setDate(start.getDate() + 1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 30);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

// Centre: get next 30 days schedule counts for scheduled appointments
async function getCentreScheduleNext30(req, res) {
  try {
    const role = req.user?.role;
    if (!['vacc_centre', 'authority', 'staff'].includes(role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const { centre_id } = req.params;
    if (role !== 'authority' && req.user?.vc_id !== centre_id) {
      return res.status(403).json({ message: 'Forbidden: different centre' });
    }
    const { start, end } = getDateRangeNext30();
    const items = await Appointment.find({ center_id: centre_id, status: 'scheduled', date: { $gte: start, $lte: end } }).lean();
    const counts = new Map();
    for (const appt of items) {
      const d = new Date(appt.date);
      const key = d.toISOString().slice(0, 10);
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    const result = [];
    const cursor = new Date(start);
    while (cursor <= end) {
      const key = cursor.toISOString().slice(0, 10);
      result.push({ date: key, scheduled_count: counts.get(key) || 0 });
      cursor.setDate(cursor.getDate() + 1);
      cursor.setHours(0, 0, 0, 0);
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to get centre schedule' });
  }
}

// Citizen: get available dates within next 30 days for a centre, where scheduled < capacity
async function getAvailableDatesNext30(req, res) {
  try {
    const role = req.user?.role;
    if (role !== 'citizen') {
      return res.status(403).json({ message: 'Forbidden: citizen only' });
    }
    const { centre_id } = req.params;
    const capDoc = await CenterCapacity.findOne({ centre_id });
    const capacity = capDoc ? Number(capDoc.capacity) : 0;
    if (capacity <= 0) {
      return res.status(200).json([]);
    }
    const { start, end } = getDateRangeNext30();
    const items = await Appointment.find({ center_id: centre_id, date: { $gte: start, $lte: end } }).lean();
    console.log(items)
    const counts = new Map();
    for (const appt of items) {
      const d = new Date(appt.date);
      const key = d.toISOString().slice(0, 10);
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    const result = [];
    const cursor = new Date(start);
    while (cursor <= end) {
      const key = cursor.toISOString().slice(0, 10);
      const scheduled = counts.get(key) || 0;
      if (scheduled < capacity) {
        result.push({ date: key, available: capacity - scheduled });
      }
      cursor.setDate(cursor.getDate() + 1);
      cursor.setHours(0, 0, 0, 0);
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to get available dates' });
  }
}

module.exports = {
  addCapacity,
  updateCapacity,
  getCapacityByCentre,
  getCentreScheduleNext30,
  getAvailableDatesNext30,
};