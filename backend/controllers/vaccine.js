const Vaccine = require('../models/vaccine');
const VaccineLog = require('../models/vaccine_log');

async function addVaccine(req, res) {
  try {
    const { name, description } = req.body;
    if (!name || !description) {
      return res.status(400).json({ message: 'name and description are required' });
    }
    const exists = await Vaccine.findOne({ name });
    if (exists) {
      return res.status(409).json({ message: 'Vaccine with this name already exists' });
    }
    const created = await Vaccine.create({ name, description });
    return res.status(201).json({ id: created._id, name: created.name, description: created.description });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to add vaccine' });
  }
}

async function updateVaccine(req, res) {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    if (!name && !description) {
      return res.status(400).json({ message: 'Provide name or description to update' });
    }
    const doc = await Vaccine.findById(id);
    if (!doc) {
      return res.status(404).json({ message: 'Vaccine not found' });
    }
    if (name) doc.name = name;
    if (description) doc.description = description;
    await doc.save();
    return res.json({ id: doc._id, name: doc.name, description: doc.description });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update vaccine' });
  }
}

module.exports = { addVaccine, updateVaccine };

async function listVaccines(req, res) {
  try {
    const docs = await Vaccine.find({});
    const result = docs.map((d) => ({ id: d._id, name: d.name, description: d.description }));
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch vaccines' });
  }
}

module.exports.listVaccines = listVaccines;

async function createVaccineLog(req, res) {
  try {
    if (req.user?.role !== 'staff') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const { vaccine_id, vaccine_name, citizen_id, date } = req.body;
    if (!vaccine_id || !vaccine_name || !citizen_id) {
      return res.status(400).json({ message: 'vaccine_id, vaccine_name, citizen_id are required' });
    }
    const centre_id = req.user.vc_id;
    const staff_id = req.user.staff_id;
    const logDoc = await VaccineLog.create({
      citizen_id,
      centre_id,
      vaccine_id,
      vaccine_name,
      staff_id,
      date: date ? new Date(date) : new Date(),
    });
    return res.status(201).json({
      id: logDoc._id,
      citizen_id: logDoc.citizen_id,
      centre_id: logDoc.centre_id,
      vaccine_id: logDoc.vaccine_id,
      vaccine_name: logDoc.vaccine_name,
      staff_id: logDoc.staff_id,
      date: logDoc.date,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to create vaccine log' });
  }
}

async function getLogsByCentre(req, res) {
  try {
    const { centre_id } = req.params;
    const role = req.user?.role;
    if (!centre_id) return res.status(400).json({ message: 'centre_id is required' });
    if (role === 'vacc_centre' && req.user.vc_id !== centre_id) {
      return res.status(403).json({ message: 'Forbidden: centre mismatch' });
    }
    const logs = await VaccineLog.find({ centre_id }).sort({ date: -1 });
    return res.json(logs);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch logs by centre' });
  }
}

async function getLogsByStaff(req, res) {
  try {
    const { staff_id } = req.params;
    const role = req.user?.role;
    if (!staff_id) return res.status(400).json({ message: 'staff_id is required' });
    if (role === 'staff' && req.user.staff_id !== staff_id) {
      return res.status(403).json({ message: 'Forbidden: staff mismatch' });
    }
    let query = { staff_id };
    if (role === 'vacc_centre') {
      query.centre_id = req.user.vc_id;
    }
    const logs = await VaccineLog.find(query).sort({ date: -1 });
    return res.json(logs);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch logs by staff' });
  }
}

async function getLogsByCitizen(req, res) {
  try {
    const { citizen_id } = req.params;
    const role = req.user?.role;
    if (!citizen_id) return res.status(400).json({ message: 'citizen_id is required' });
    if (role === 'citizen' && req.user.sub !== citizen_id) {
      return res.status(403).json({ message: 'Forbidden: citizen mismatch' });
    }
    let query = { citizen_id };
    if (role === 'vacc_centre') {
      query.centre_id = req.user.vc_id;
    }
    const logs = await VaccineLog.find(query).sort({ date: -1 });
    return res.json(logs);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch logs by citizen' });
  }
}

module.exports.createVaccineLog = createVaccineLog;
module.exports.getLogsByCentre = getLogsByCentre;
module.exports.getLogsByStaff = getLogsByStaff;
module.exports.getLogsByCitizen = getLogsByCitizen;