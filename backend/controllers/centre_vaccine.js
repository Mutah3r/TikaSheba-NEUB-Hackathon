const CentreVaccine = require('../models/centre_vaccine');
const Authority = require('../models/authority');
const { sendEmail } = require('../utils/email');
const Notification = require('../models/notification');
const Vacc_centre = require('../models/vacc_centre');
const Vaccine = require('../models/vaccine');

// Authority: add or create centre vaccine (centre_id, vaccine_id, vaccine_name)
async function addCentreVaccine(req, res) {
  try {
    const { centre_id, vaccine_id, vaccine_name } = req.body;
    if (req.user.role !== 'authority') {
      return res.status(403).json({ message: 'Forbidden: authority only' });
    }
    if (!centre_id || !vaccine_id || !vaccine_name) {
      return res.status(400).json({ message: 'centre_id, vaccine_id, vaccine_name are required' });
    }
    const existing = await CentreVaccine.findOne({ centre_id, vaccine_id });
    if (existing) {
      return res.status(409).json({ message: 'Centre vaccine already exists for this centre and vaccine_id', id: existing._id });
    }
    const doc = await CentreVaccine.create({
      centre_id,
      vaccine_id,
      vaccine_name,
      current_stock: 0,
      requested_stock_amount: 0,
      created_at: new Date(),
    });
    return res.status(201).json({ message: 'Centre vaccine created', data: doc });
  } catch (err) {
    console.error('addCentreVaccine error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Authority: delete centre vaccine (by schema id)
async function deleteCentreVaccine(req, res) {
  try {
    if (req.user.role !== 'authority') {
      return res.status(403).json({ message: 'Forbidden: authority only' });
    }
    const { id } = req.params;
    const deleted = await CentreVaccine.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Centre vaccine not found' });
    }
    return res.status(200).json({ message: 'Centre vaccine deleted', id });
  } catch (err) {
    console.error('deleteCentreVaccine error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Authority: get requested stock by id and status=requested
async function getRequestedById(req, res) {
  try {
    if (req.user.role !== 'authority') {
      return res.status(403).json({ message: 'Forbidden: authority only' });
    }
    const { id } = req.params;
    const doc = await CentreVaccine.findById(id);
    if (!doc) return res.status(404).json({ message: 'Centre vaccine not found' });
    if (doc.requested_status !== 'requested') {
      return res.status(404).json({ message: 'No requested stock for this centre vaccine' });
    }
    return res.status(200).json({
      id: doc._id,
      centre_id: doc.centre_id,
      vaccine_id: doc.vaccine_id,
      vaccine_name: doc.vaccine_name,
      requested_stock_amount: doc.requested_stock_amount,
      requested_status: doc.requested_status,
    });
  } catch (err) {
    console.error('getRequestedById error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Authority: get all requested stock by status=requested
async function getAllRequested(req, res) {
  try {
    if (req.user.role !== 'authority') {
      return res.status(403).json({ message: 'Forbidden: authority only' });
    }
    const docs = await CentreVaccine.find({ requested_status: 'requested' });
    return res.status(200).json(docs);
  } catch (err) {
    console.error('getAllRequested error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Authority: update status to 'sent'
async function updateStatus(req, res) {
  try {
    if (req.user.role !== 'authority') {
      return res.status(403).json({ message: 'Forbidden: authority only' });
    }
    const { id } = req.params;
    const { status } = req.body;
    if (!status || !['requested', 'sent'].includes(status)) {
      return res.status(400).json({ message: "status must be 'requested' or 'sent'" });
    }
    const updated = await CentreVaccine.findByIdAndUpdate(
      id,
      { requested_status: status },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Centre vaccine not found' });
    return res.status(200).json({ message: 'Status updated', data: updated });
  } catch (err) {
    console.error('updateStatus error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Authority: bulk add centre vaccines for a given centre_id
// Body: { centre_id: string, items: Array<{ vaccine_id: string, vaccine_name: string }> }
async function addCentreVaccinesBulk(req, res) {
  try {
    if (req.user.role !== 'authority') {
      return res.status(403).json({ message: 'Forbidden: authority only' });
    }
    const { centre_id, items } = req.body || {};
    if (!centre_id || !Array.isArray(items)) {
      return res.status(400).json({ message: 'centre_id and items[] are required' });
    }
    const cleaned = items
      .filter(i => i && typeof i === 'object')
      .map(i => ({ vaccine_id: String(i.vaccine_id || ''), vaccine_name: String(i.vaccine_name || '') }))
      .filter(i => i.vaccine_id && i.vaccine_name);
    if (!cleaned.length) {
      return res.status(400).json({ message: 'items must contain vaccine_id and vaccine_name' });
    }
    const dedupIds = Array.from(new Set(cleaned.map(i => i.vaccine_id)));
    const existing = await CentreVaccine.find({ centre_id, vaccine_id: { $in: dedupIds } })
      .select('vaccine_id')
      .lean();
    const existingSet = new Set((existing || []).map(e => e.vaccine_id));
    const toCreate = cleaned.filter(i => !existingSet.has(i.vaccine_id)).map(i => ({
      centre_id,
      vaccine_id: i.vaccine_id,
      vaccine_name: i.vaccine_name,
      current_stock: 0,
      requested_stock_amount: 0,
      created_at: new Date(),
    }));
    if (!toCreate.length) {
      return res.status(200).json({
        message: 'No new entries to insert; all already exist',
        centre_id,
        created_count: 0,
        skipped_count: cleaned.length,
        created_ids: [],
      });
    }
    const inserted = await CentreVaccine.insertMany(toCreate, { ordered: false });
    const created_ids = (inserted || []).map(d => d._id.toString());
    return res.status(201).json({
      message: 'Bulk centre vaccines added',
      centre_id,
      created_count: created_ids.length,
      skipped_count: cleaned.length - created_ids.length,
      created_ids,
    });
  } catch (err) {
    console.error('addCentreVaccinesBulk error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Vaccine centre: update stock (add or decrease)
async function updateStock(req, res) {
  try {
    if (req.user.role !== 'vacc_centre') {
      return res.status(403).json({ message: 'Forbidden: vacc_centre only' });
    }
    const { id } = req.params;
    const { operation, amount } = req.body;
    if (!operation || !['add', 'decrease'].includes(operation)) {
      return res.status(400).json({ message: "operation must be 'add' or 'decrease'" });
    }
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      return res.status(400).json({ message: 'amount must be a positive number' });
    }
    const doc = await CentreVaccine.findById(id);
    if (!doc) return res.status(404).json({ message: 'Centre vaccine not found' });
    if (doc.centre_id !== req.user.vc_id) {
      return res.status(403).json({ message: 'Cannot update stock for another centre' });
    }

    let newStock = doc.current_stock;
    if (operation === 'add') newStock += amt;
    else newStock -= amt;

    if (newStock < 0) {
      return res.status(400).json({ message: 'Resulting stock cannot be negative' });
    }

    // If authority previously sent stock, and centre updates less than requested, notify authorities
    if (operation === 'add' && doc.requested_status === 'sent' && amt < (doc.requested_stock_amount || 0)) {
      try {
        const authorities = await Authority.find({}, { email: 1 });
        const recipients = authorities.map(a => a.email).filter(Boolean);
        const subject = 'Stock mismatch notification';
        const message = `Centre ${doc.centre_id} updated stock with ${amt} for ${doc.vaccine_name} (requested ${doc.requested_stock_amount}).`;
        // send emails to all authorities
        await Promise.all(recipients.map(email => sendEmail({ to: email, subject, text: message })));
        // save notification
        await Notification.create({
          type: 'stock_mismatch',
          centre_id: doc.centre_id,
          centre_vaccine_id: String(doc._id),
          requested_stock_amount: doc.requested_stock_amount || 0,
          delivered_stock_amount: amt,
          subject,
          message,
          recipients,
        });
      } catch (notifyErr) {
        console.error('Notification error:', notifyErr);
        // Proceed without failing the stock update
      }
    }

    doc.current_stock = newStock;
    await doc.save();
    return res.status(200).json({ message: 'Stock updated', data: doc });
  } catch (err) {
    console.error('updateStock error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Vaccine centre: get all by requested status (for own centre)
async function getByRequestedStatus(req, res) {
  try {
    if (req.user.role !== 'vacc_centre') {
      return res.status(403).json({ message: 'Forbidden: vacc_centre only' });
    }
    const { status } = req.params;
    if (!status || !['requested', 'sent'].includes(status)) {
      return res.status(400).json({ message: "status must be 'requested' or 'sent'" });
    }
    const docs = await CentreVaccine.find({ centre_id: req.user.vc_id, requested_status: status });
    return res.status(200).json(docs);
  } catch (err) {
    console.error('getByRequestedStatus error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Vaccine centre: send request (set requested_stock_amount and status=requested)
async function sendRequest(req, res) {
  try {
    if (req.user.role !== 'vacc_centre') {
      return res.status(403).json({ message: 'Forbidden: vacc_centre only' });
    }
    const { id } = req.params;
    const { requested_stock_amount } = req.body;
    const amt = Number(requested_stock_amount);
    if (!amt || amt <= 0) {
      return res.status(400).json({ message: 'requested_stock_amount must be a positive number' });
    }
    const doc = await CentreVaccine.findById(id);
    if (!doc) return res.status(404).json({ message: 'Centre vaccine not found' });
    if (doc.centre_id !== req.user.vc_id) {
      return res.status(403).json({ message: 'Cannot request for another centre' });
    }
    doc.requested_stock_amount = amt;
    doc.requested_status = 'requested';
    await doc.save();
    return res.status(200).json({ message: 'Request submitted', data: doc });
  } catch (err) {
    console.error('sendRequest error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Vaccine centre: get all vaccines assigned to their centre
async function getAssignedForCentre(req, res) {
  try {
    if (req.user.role !== 'vacc_centre') {
      return res.status(403).json({ message: 'Forbidden: vacc_centre only' });
    }
    const centreId = req.user.vc_id;
    if (!centreId) {
      return res.status(400).json({ message: 'Missing centre id (vc_id) for user' });
    }
    // Fetch assigned records for this centre and derive unique vaccine names
    const assigned = await CentreVaccine.find({ centre_id: centreId })
      .select('vaccine_name')
      .lean();
    const names = Array.from(new Set((assigned || []).map((d) => d.vaccine_name).filter(Boolean)));

    if (!names.length) {
      return res.status(200).json([]);
    }

    // Fetch vaccine metadata by names and return only name and description
    const vaccines = await Vaccine.find({ name: { $in: names } })
      .select('name description _id')
      .lean();
    const result = (vaccines || []).map((v) => ({ id: v._id.toString(), name: v.name, description: v.description }));
    return res.status(200).json(result);
  } catch (err) {
    console.error('getAssignedForCentre error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Authority: get all vaccines assigned to a specific centre (by centre_id)
async function getAssignedForCentreByAuthority(req, res) {
  try {
    if (req.user.role !== 'authority') {
      return res.status(403).json({ message: 'Forbidden: authority only' });
    }
    const { centre_id } = req.params;
    if (!centre_id) {
      return res.status(400).json({ message: 'centre_id is required' });
    }
    const assigned = await CentreVaccine.find({ centre_id })
      .select('vaccine_name')
      .lean();
    const names = Array.from(new Set((assigned || []).map((d) => d.vaccine_name).filter(Boolean)));
    if (!names.length) {
      return res.status(200).json([]);
    }
    const vaccines = await Vaccine.find({ name: { $in: names } })
      .select('name description _id')
      .lean();
    const result = (vaccines || []).map((v) => ({ id: v._id.toString(), name: v.name, description: v.description }));
    return res.status(200).json(result);
  } catch (err) {
    console.error('getAssignedForCentreByAuthority error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = {
  addCentreVaccine,
  deleteCentreVaccine,
  getRequestedById,
  getAllRequested,
  updateStatus,
  updateStock,
  getByRequestedStatus,
  sendRequest,
  getAssignedForCentre,
  getAssignedForCentreByAuthority,
  addCentreVaccinesBulk,
};

// Public: Get all centres that currently have stock for a given vaccine_id
async function getCentresWithStockByVaccine(req, res) {
  try {
    const { vaccine_id } = req.params;
    if (!vaccine_id) {
      return res.status(400).json({ message: 'vaccine_id is required' });
    }
    const entries = await CentreVaccine.find({ vaccine_id, current_stock: { $gt: 0 } }).lean();
    if (!entries.length) {
      return res.json([]);
    }
    const vcIds = [...new Set(entries.map(e => e.centre_id))];
    const centres = await Vacc_centre.find({ vc_id: { $in: vcIds } }).lean();
    const centreMap = new Map(centres.map(c => [c.vc_id, c]));
    const result = entries.map(e => {
      const c = centreMap.get(e.centre_id) || {};
      return {
        centre: {
          id: c._id ? c._id.toString() : null,
          vc_id: e.centre_id,
          name: c.name || null,
          location: c.location || null,
          district: c.district || null,
          lattitude: c.lattitude ?? null,
          longitude: c.longitude ?? null,
          staff_count: Array.isArray(c.staffs) ? c.staffs.length : 0,
        },
        stock: {
          centre_vaccine_id: e._id.toString(),
          vaccine_id: e.vaccine_id,
          vaccine_name: e.vaccine_name,
          current_stock: e.current_stock,
          total_people: e.total_people || 0,
          total_dosed: e.total_dosed || 0,
          total_wasted: e.total_wasted || 0,
        },
      };
    });
    return res.json(result);
  } catch (err) {
    console.error('getCentresWithStockByVaccine error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports.getCentresWithStockByVaccine = getCentresWithStockByVaccine;