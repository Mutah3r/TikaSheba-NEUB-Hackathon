const Authority = require('../models/authority');
const Citizen = require('../models/citizen');
const VaccCentre = require('../models/vacc_centre');

async function getUser(req, res) {
  try {
    const role = req.user?.role;
    const sub = req.user?.sub;
    if (!role) {
      return res.status(400).json({ message: 'Role missing in token' });
    }
    if (role === 'authority') {
      const doc = await Authority.findById(sub);
      if (!doc) return res.status(404).json({ message: 'Authority not found' });
      return res.json({ id: doc._id.toString(), name: doc.name, role });
    }
    if (role === 'citizen') {
      const doc = await Citizen.findById(sub);
      if (!doc) return res.status(404).json({ message: 'Citizen not found' });
      return res.json({ id: doc._id.toString(), name: doc.name, role });
    }
    if (role === 'vacc_centre') {
      const doc = await VaccCentre.findById(sub);
      if (!doc) return res.status(404).json({ message: 'Centre not found' });
      return res.json({ id: doc._id.toString(), name: doc.name, role });
    }
    if (role === 'staff') {
      const { vc_id, staff_id } = req.user;
      if (!vc_id || !staff_id) {
        return res.status(400).json({ message: 'vc_id or staff_id missing in token' });
      }
      const centre = await VaccCentre.findOne({ vc_id });
      if (!centre) return res.status(404).json({ message: 'Centre not found' });
      const staff = (Array.isArray(centre.staffs) ? centre.staffs : []).find((s) => String(s.id) === String(staff_id));
      if (!staff) return res.status(404).json({ message: 'Staff not found' });
      return res.json({ id: staff.id, name: staff.name, role });
    }
    return res.status(400).json({ message: 'Unknown role' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to get user' });
  }
}

module.exports = { getUser };