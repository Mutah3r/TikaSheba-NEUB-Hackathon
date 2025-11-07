const Appointment = require('../models/appointments');

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