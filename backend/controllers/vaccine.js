const Vaccine = require('../models/vaccine');
const VaccineLog = require('../models/vaccine_log');
const Citizen = require('../models/citizen');
const VaccCentre = require('../models/vacc_centre');
const CenterCapacity = require('../models/center_maximum_capacity');
const Staff = require('../models/staff');

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

// NEW: Get logs by citizen registration ID
async function getLogsByRegNo(req, res) {
  try {
    const { reg_no } = req.params;
    const role = req.user?.role;
    if (!reg_no) return res.status(400).json({ message: 'reg_no is required' });

    const citizen = await Citizen.findOne({ reg_no });
    if (!citizen) {
      return res.status(404).json({ message: 'Citizen not found for reg_no' });
    }

    // If citizen is requesting, ensure they only access their own data
    if (role === 'citizen' && req.user.sub !== citizen._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: citizen mismatch' });
    }

    let query = { citizen_id: citizen._id.toString() };
    if (role === 'vacc_centre') {
      query.centre_id = req.user.vc_id;
    }
    const logs = await VaccineLog.find(query).sort({ date: -1 });
    return res.json({
      citizen: { id: citizen._id.toString(), name: citizen.name, reg_no: citizen.reg_no },
      logs,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch logs by reg_no' });
  }
}

module.exports.createVaccineLog = createVaccineLog;
module.exports.getLogsByCentre = getLogsByCentre;
module.exports.getLogsByStaff = getLogsByStaff;
module.exports.getLogsByCitizen = getLogsByCitizen;
module.exports.getLogsByRegNo = getLogsByRegNo;

// Centre Overview (Details and last-week metrics)
async function getCentreOverview(req, res) {
  try {
    const { centre_id } = req.params;
    if (!centre_id) return res.status(400).json({ message: 'centre_id is required' });

    const role = req.user?.role;
    // RBAC: staff and vacc_centre can only access their own centre
    if ((role === 'vacc_centre' || role === 'staff') && req.user.vc_id !== centre_id) {
      return res.status(403).json({ message: 'Forbidden: centre mismatch' });
    }

    // Centre details
    const centreDoc = await VaccCentre.findOne({ vc_id: centre_id });
    if (!centreDoc) {
      return res.status(404).json({ message: 'Centre not found' });
    }
    const totalStaff = Array.isArray(centreDoc.staffs) ? centreDoc.staffs.length : 0;

    // Capacity
    const capDoc = await CenterCapacity.findOne({ centre_id });
    const maximumCapacity = capDoc?.capacity ?? 0;

    // Last week range
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);

    // People served & dosages (using VaccineLog entries)
    const servedCount = await VaccineLog.countDocuments({
      centre_id,
      date: { $gte: weekStart, $lte: now },
    });
    const dosagesCount = servedCount;

    // Wasted vaccines from staff logs
    const staffDocs = await Staff.find({ centre_id });
    let wastedCount = 0;
    for (const s of staffDocs) {
      if (Array.isArray(s.vaccine_list)) {
        for (const v of s.vaccine_list) {
          if (Array.isArray(v.log)) {
            for (const l of v.log) {
              const d = new Date(l.date);
              if (d >= weekStart && d <= now) {
                wastedCount += Number(l.dose_wasted || 0);
              }
            }
          }
        }
      }
    }

    return res.json({
      centre: {
        name: centreDoc.name,
        location: centreDoc.location,
        id: centreDoc.vc_id,
        total_staff: totalStaff,
        maximum_capacity: maximumCapacity,
      },
      last_week: {
        total_people_served: servedCount,
        vaccine_dosages: dosagesCount,
        wasted_vaccines: wastedCount,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch centre overview' });
  }
}

module.exports.getCentreOverview = getCentreOverview;