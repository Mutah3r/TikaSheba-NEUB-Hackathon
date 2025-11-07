const Notification = require('../models/notification');

// Authority-only: list notifications. Optional filters via query params.
// Query params: type, centre_id, since (ISO date)
async function listForAuthority(req, res) {
  try {
    // Ensure role is authority (defense-in-depth; route also enforces)
    if (!req.user || req.user.role !== 'authority') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const { type, centre_id, since } = req.query;
    const q = {};
    if (type) q.type = type;
    if (centre_id) q.centre_id = centre_id;
    if (since) {
      const d = new Date(since);
      if (!isNaN(d.getTime())) {
        q.created_at = { $gte: d };
      }
    }
    const items = await Notification.find(q).sort({ created_at: -1 }).lean();
    // Map to safe output
    const result = items.map(n => ({
      id: n._id.toString(),
      type: n.type || null,
      centre_id: n.centre_id || null,
      centre_vaccine_id: n.centre_vaccine_id || null,
      requested_stock_amount: n.requested_stock_amount ?? null,
      delivered_stock_amount: n.delivered_stock_amount ?? null,
      subject: n.subject,
      message: n.message,
      recipients: Array.isArray(n.recipients) ? n.recipients : [],
      created_at: n.created_at,
    }));
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch notifications' });
  }
}

module.exports = { listForAuthority };