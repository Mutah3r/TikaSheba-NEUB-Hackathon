const Appointment = require('../models/appointments');
const Citizen = require('../models/citizen');

function toKey(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Centre: get served (done) counts per day for the last 7 days
// Access: vacc_centre, staff
// Centre is derived from req.user.vc_id (no path param)
// Query (optional): start, end as YYYY-MM-DD; defaults to last 7 days ending today
async function getWeeklyServedByCentre(req, res) {
  try {
    const role = req.user?.role;
    if (!['vacc_centre', 'staff'].includes(role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const centreId = req.user?.vc_id;
    if (!centreId) {
      return res.status(400).json({ message: 'Missing centre id (vc_id) for user' });
    }

    const now = new Date();
    let start = req.query.start ? new Date(req.query.start) : new Date(now);
    let end = req.query.end ? new Date(req.query.end) : new Date(now);
    // Default to the last 7 days if start not provided
    if (!req.query.start) {
      start.setDate(start.getDate() - 6);
    }
    // Normalize bounds to whole days
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const items = await Appointment.find({
      center_id: centreId,
      status: 'done',
      date: { $gte: start, $lte: end },
    }).select('date');

    const counts = new Map();
    for (const it of items) {
      const d = new Date(it.date);
      const key = toKey(d);
      counts.set(key, (counts.get(key) || 0) + 1);
    }

    const days = [];
    const cur = new Date(start);
    let total_served = 0;
    while (cur <= end) {
      const key = toKey(cur);
      const served = counts.get(key) || 0;
      days.push({ date: key, served });
      total_served += served;
      cur.setDate(cur.getDate() + 1);
    }

    return res.status(200).json({
      start: toKey(start),
      end: toKey(end),
      days,
      total_served,
    });
  } catch (err) {
    console.error('getWeeklyServedByCentre error:', err);
    return res.status(500).json({ message: 'Failed to get weekly served counts' });
  }
}

module.exports = {
  getWeeklyServedByCentre,
};

// Centre: get appointment logs with citizen_name, vaccine_name, date, status
// Access: vacc_centre, staff
// Centre is derived from req.user.vc_id (no path param)
// Query (optional): start, end as YYYY-MM-DD; status (one of requested, scheduled, done, cancelled, missed)
async function getCentreAppointmentLogs(req, res) {
  try {
    const role = req.user?.role;
    if (!['vacc_centre', 'staff'].includes(role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const centreId = req.user?.vc_id;
    if (!centreId) {
      return res.status(400).json({ message: 'Missing centre id (vc_id) for user' });
    }

    const hasRange = Boolean(req.query.start || req.query.end);
    const now = new Date();
    let start = null;
    let end = null;
    if (hasRange) {
      start = req.query.start ? new Date(req.query.start) : null;
      end = req.query.end ? new Date(req.query.end) : null;
      // If only start provided, default end to today
      if (start && !end) end = new Date(now);
      // If only end provided, default start to 29 days before end
      if (end && !start) {
        start = new Date(end);
        start.setDate(start.getDate() - 29);
      }
      // If neither provided (shouldn't happen due to hasRange), default to last 30 days
      if (!start && !end) {
        start = new Date(now);
        start.setDate(start.getDate() - 29);
        end = new Date(now);
      }
      // Normalize bounds to whole days
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    }

    const query = {
      center_id: centreId,
    };
    if (hasRange) {
      query.date = { $gte: start, $lte: end };
    }
    const status = req.query.status;
    if (status) {
      query.status = status;
    }

    const appts = await Appointment.find(query)
      .select('citizen_id vaccine_name date status')
      .sort({ date: -1 });

    const citizenIds = [...new Set(appts.map((a) => a.citizen_id))];
    let citizens = [];
    if (citizenIds.length > 0) {
      citizens = await Citizen.find({ _id: { $in: citizenIds } }).select('name');
    }
    const cMap = new Map(citizens.map((c) => [c._id.toString(), c.name]));

    const logs = appts.map((a) => ({
      citizen_id: a.citizen_id,
      citizen_name: cMap.get(a.citizen_id) || null,
      vaccine_name: a.vaccine_name,
      date: a.date,
      status: a.status,
    }));

    return res.status(200).json({
      start: hasRange && start ? toKey(start) : null,
      end: hasRange && end ? toKey(end) : null,
      count: logs.length,
      logs,
    });
  } catch (err) {
    console.error('getCentreAppointmentLogs error:', err);
    return res.status(500).json({ message: 'Failed to get centre logs' });
  }
}

module.exports.getCentreAppointmentLogs = getCentreAppointmentLogs;