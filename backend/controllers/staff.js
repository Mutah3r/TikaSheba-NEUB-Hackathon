const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const VaccCentre = require('../models/vacc_centre');
const Staff = require('../models/staff');
const CentreVaccine = require('../models/centre_vaccine');
const VaccineLog = require('../models/vaccine_log');

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

// Centre: assign/update staff vaccine list (replace set)
async function assignVaccines(req, res) {
  try {
    if (!req.user || req.user.role !== 'vacc_centre') {
      return res.status(403).json({ message: 'Forbidden: vacc_centre only' });
    }
    const centreId = req.user.vc_id;
    const { staff_id } = req.params;
    const { centre_vaccine_ids } = req.body; // array of centre vaccine _id strings
    if (!staff_id || !Array.isArray(centre_vaccine_ids)) {
      return res.status(400).json({ message: 'staff_id param and centre_vaccine_ids array are required' });
    }
    if (centre_vaccine_ids.length === 0) {
      // allow clearing list
      const doc = await Staff.findOneAndUpdate(
        { staff_id, centre_id: centreId },
        { vaccine_list: [] },
        { upsert: true, new: true }
      );
      return res.json({ message: 'Staff vaccine list updated', data: doc });
    }
    const vaccines = await CentreVaccine.find({ _id: { $in: centre_vaccine_ids } }).lean();
    if (vaccines.length !== centre_vaccine_ids.length) {
      return res.status(404).json({ message: 'One or more centre_vaccine_ids not found' });
    }
    for (const v of vaccines) {
      if (v.centre_id !== centreId) {
        return res.status(403).json({ message: 'Cannot assign vaccines from another centre' });
      }
    }
    const vaccine_list = vaccines.map(v => ({
      centre_vaccine_id: v._id.toString(),
      vaccine_name: v.vaccine_name,
      log: [],
    }));
    const doc = await Staff.findOneAndUpdate(
      { staff_id, centre_id: centreId },
      { staff_id, centre_id: centreId, vaccine_list },
      { upsert: true, new: true }
    );
    return res.json({ message: 'Staff vaccine list updated', data: doc });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to assign staff vaccines' });
  }
}

// Staff: get own vaccine list
async function getMyVaccineList(req, res) {
  try {
    if (!req.user || req.user.role !== 'staff') {
      return res.status(403).json({ message: 'Forbidden: staff only' });
    }
    const doc = await Staff.findOne({ staff_id: req.user.staff_id, centre_id: req.user.vc_id }).lean();
    return res.json({ vaccine_list: doc ? doc.vaccine_list : [] });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch staff vaccine list' });
  }
}

// Staff: create log for a centre vaccine assignment
async function createLog(req, res) {
  try {
    if (!req.user || req.user.role !== 'staff') {
      return res.status(403).json({ message: 'Forbidden: staff only' });
    }
    const { centre_vaccine_id, date, dose_used, dose_wasted } = req.body;
    if (!centre_vaccine_id || !date) {
      return res.status(400).json({ message: 'centre_vaccine_id and date are required' });
    }
    const du = Number(dose_used) || 0;
    const dw = Number(dose_wasted) || 0;
    const doc = await Staff.findOne({ staff_id: req.user.staff_id, centre_id: req.user.vc_id });
    if (!doc) {
      return res.status(404).json({ message: 'Staff record not found' });
    }
    const item = doc.vaccine_list.find(v => v.centre_vaccine_id === centre_vaccine_id);
    if (!item) {
      return res.status(403).json({ message: 'This vaccine is not assigned to the staff' });
    }
    item.log.push({ date: new Date(date), dose_used: du, dose_wasted: dw });
    await doc.save();
    return res.status(201).json({ message: 'Log created', data: item });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to create staff log' });
  }
}

// Centre: get staff efficiency summary
async function getEfficiency(req, res) {
  try {
    if (!req.user || req.user.role !== 'vacc_centre') {
      return res.status(403).json({ message: 'Forbidden: vacc_centre only' });
    }
    const { staff_id } = req.params;
    if (!staff_id) {
      return res.status(400).json({ message: 'staff_id is required' });
    }
    const doc = await Staff.findOne({ staff_id, centre_id: req.user.vc_id }).lean();
    if (!doc) {
      return res.status(404).json({ message: 'Staff record not found' });
    }
    const perVaccine = (doc.vaccine_list || []).map(v => {
      const totals = (v.log || []).reduce((acc, l) => {
        acc.dose_used += Number(l.dose_used) || 0;
        acc.dose_wasted += Number(l.dose_wasted) || 0;
        return acc;
      }, { dose_used: 0, dose_wasted: 0 });
      return {
        centre_vaccine_id: v.centre_vaccine_id,
        vaccine_name: v.vaccine_name,
        total_dose_used: totals.dose_used,
        total_dose_wasted: totals.dose_wasted,
      };
    });
    const peopleServed = await VaccineLog.countDocuments({ staff_id, centre_id: req.user.vc_id });
    return res.json({ staff_id, centre_id: req.user.vc_id, per_vaccine: perVaccine, total_people_served: peopleServed });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to compute staff efficiency' });
  }
}

module.exports.assignVaccines = assignVaccines;
module.exports.getMyVaccineList = getMyVaccineList;
module.exports.createLog = createLog;
module.exports.getEfficiency = getEfficiency;

// Centre or Authority: aggregate daily dose used/wasted for a centre_vaccine_id across all staff
async function getDailyUsageByCentreVaccine(req, res) {
  try {
    const { centre_vaccine_id } = req.params;
    if (!centre_vaccine_id) {
      return res.status(400).json({ message: 'centre_vaccine_id is required' });
    }
    const cv = await CentreVaccine.findById(centre_vaccine_id).lean();
    if (!cv) {
      return res.status(404).json({ message: 'centre_vaccine_id not found' });
    }
    // If centre, enforce same centre
    if (req.user?.role === 'vacc_centre' && req.user?.vc_id !== cv.centre_id) {
      return res.status(403).json({ message: 'Forbidden: different centre' });
    }
    // Collect staff docs for this centre
    const staffDocs = await Staff.find({ centre_id: cv.centre_id }).lean();
    // Build last 100 days window (inclusive, ending today)
    const end = new Date();
    end.setHours(0, 0, 0, 0);
    const start = new Date(end);
    start.setDate(start.getDate() - 99);
    const map = new Map(); // date (YYYY-MM-DD) -> { used, wasted }
    for (const doc of staffDocs) {
      const list = Array.isArray(doc.vaccine_list) ? doc.vaccine_list : [];
      const item = list.find(v => v.centre_vaccine_id === centre_vaccine_id);
      if (!item) continue;
      const logs = Array.isArray(item.log) ? item.log : [];
      for (const l of logs) {
        const d = new Date(l.date);
        d.setHours(0, 0, 0, 0);
        if (d < start || d > end) continue; // only aggregate within window
        const key = d.toISOString().slice(0, 10);
        const used = Number(l.dose_used) || 0;
        const wasted = Number(l.dose_wasted) || 0;
        const prev = map.get(key) || { used: 0, wasted: 0 };
        prev.used += used;
        prev.wasted += wasted;
        map.set(key, prev);
      }
    }
    const daily = [];
    const cursor = new Date(start);
    while (cursor <= end) {
      const key = cursor.toISOString().slice(0, 10);
      const sums = map.get(key) || { used: 0, wasted: 0 };
      daily.push({ date: key, total_dose_used: sums.used, total_dose_wasted: sums.wasted });
      cursor.setDate(cursor.getDate() + 1);
      cursor.setHours(0, 0, 0, 0);
    }
    return res.json({
      centre_vaccine_id,
      centre_id: cv.centre_id,
      vaccine_name: cv.vaccine_name,
      daily,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to aggregate daily usage' });
  }
}

module.exports.getDailyUsageByCentreVaccine = getDailyUsageByCentreVaccine;

// Centre or Authority: list each staff in a centre with per-vaccine totals (dose_used, dose_wasted)
async function getStaffVaccineUsageSummary(req, res) {
  try {
    const { centre_id } = req.params;
    if (!centre_id) {
      return res.status(400).json({ message: 'centre_id is required' });
    }
    if (!req.user || !['vacc_centre', 'authority'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if (req.user.role === 'vacc_centre' && req.user.vc_id !== centre_id) {
      return res.status(403).json({ message: 'Forbidden: different centre' });
    }

    const staffDocs = await Staff.find({ centre_id }).lean();
    const staff = staffDocs.map((doc) => {
      const vaccines = (doc.vaccine_list || []).map((v) => {
        const totals = (v.log || []).reduce(
          (acc, l) => {
            acc.used += Number(l.dose_used) || 0;
            acc.wasted += Number(l.dose_wasted) || 0;
            return acc;
          },
          { used: 0, wasted: 0 }
        );
        return {
          centre_vaccine_id: v.centre_vaccine_id,
          vaccine_name: v.vaccine_name,
          total_dose_used: totals.used,
          total_dose_wasted: totals.wasted,
        };
      });
      return {
        staff_id: doc.staff_id,
        centre_id: doc.centre_id,
        vaccines,
      };
    });

    return res.json({ centre_id, staff });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to list staff vaccine usage' });
  }
}

module.exports.getStaffVaccineUsageSummary = getStaffVaccineUsageSummary;