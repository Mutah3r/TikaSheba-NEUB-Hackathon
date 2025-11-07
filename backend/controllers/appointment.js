const Appointment = require('../models/appointments');
const Citizen = require('../models/citizen');

function ensureCitizenAccess(req, res, citizenId) {
  const role = req.user?.role;
  if (role === 'citizen' && req.user?.sub !== citizenId) {
    res.status(403).json({ message: 'Forbidden: cannot access other citizens' });
    return false;
  }
  return true;
}

// Citizen: create appointment (requested) and generate QR URL
async function createAppointment(req, res) {
  try {
    if (req.user?.role !== 'citizen') {
      return res.status(403).json({ message: 'Forbidden: citizen only' });
    }
    const { citizen_id, vaccine_id, vaccine_name, center_id, date, time } = req.body;
    if (!citizen_id || !vaccine_id || !vaccine_name || !center_id || !date || !time) {
      return res.status(400).json({ message: 'citizen_id, vaccine_id, vaccine_name, center_id, date, time are required' });
    }
    if (req.user?.sub !== citizen_id) {
      return res.status(403).json({ message: 'Forbidden: cannot create for other citizen' });
    }
    const appt = await Appointment.create({ citizen_id, vaccine_id, vaccine_name, center_id, date, time, status: 'requested' });
    const qrPayload = JSON.stringify({ type: 'appointment', id: String(appt._id), centre_id: center_id, citizen_id, vaccine_id });
    const qr_url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrPayload)}`;
    appt.qr_url = qr_url;
    await appt.save();
    return res.status(201).json(appt);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to create appointment' });
  }
}

// Citizen: get all appointments by citizen id
async function getAppointmentsByCitizen(req, res) {
  try {
    const { citizen_id } = req.params;
    if (!ensureCitizenAccess(req, res, citizen_id)) return;
    const items = await Appointment.find({ citizen_id });
    return res.status(200).json(items);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to get appointments' });
  }
}

// Citizen: get all appointments by citizen id and status
async function getAppointmentsByCitizenAndStatus(req, res) {
  try {
    const { citizen_id, status } = req.params;
    if (!ensureCitizenAccess(req, res, citizen_id)) return;
    const items = await Appointment.find({ citizen_id, status });
    return res.status(200).json(items);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to get appointments by status' });
  }
}

// Citizen: update status to cancelled
async function cancelAppointment(req, res) {
  try {
    if (req.user?.role !== 'citizen') {
      return res.status(403).json({ message: 'Forbidden: citizen only' });
    }
    const { id } = req.params;
    const appt = await Appointment.findById(id);
    if (!appt) return res.status(404).json({ message: 'Appointment not found' });
    if (appt.citizen_id !== req.user?.sub) {
      return res.status(403).json({ message: 'Forbidden: cannot modify other citizens' });
    }
    if (appt.status === 'done' || appt.status === 'missed') {
      return res.status(400).json({ message: 'Cannot cancel completed or missed appointment' });
    }
    appt.status = 'cancelled';
    await appt.save();
    return res.status(200).json({ message: 'Appointment cancelled', id });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to cancel appointment' });
  }
}

// Centre: get all appointments by centre id
async function getAppointmentsByCentre(req, res) {
  try {
    const { centre_id } = req.params;
    const role = req.user?.role;
    if (!['vacc_centre', 'authority', 'staff'].includes(role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if (role !== 'authority' && req.user?.vc_id !== centre_id) {
      return res.status(403).json({ message: 'Forbidden: cannot access other centres' });
    }
    const items = await Appointment.find({ center_id: centre_id });
    return res.status(200).json(items);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to get centre appointments' });
  }
}

// Centre: get appointments by centre id and status
async function getAppointmentsByCentreAndStatus(req, res) {
  try {
    const { centre_id, status } = req.params;
    const role = req.user?.role;
    if (!['vacc_centre', 'authority', 'staff'].includes(role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if (role !== 'authority' && req.user?.vc_id !== centre_id) {
      return res.status(403).json({ message: 'Forbidden: cannot access other centres' });
    }
    const items = await Appointment.find({ center_id: centre_id, status });
    return res.status(200).json(items);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to get centre appointments by status' });
  }
}

// Centre: get appointments by centre id, status and time (time exact match)
async function getAppointmentsByCentreStatusAndTime(req, res) {
  try {
    const { centre_id, status, time } = req.params;
    const role = req.user?.role;
    if (!['vacc_centre', 'authority', 'staff'].includes(role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if (role !== 'authority' && req.user?.vc_id !== centre_id) {
      return res.status(403).json({ message: 'Forbidden: cannot access other centres' });
    }
    const items = await Appointment.find({ center_id: centre_id, status, time });
    return res.status(200).json(items);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to get centre appointments by status and time' });
  }
}

// Centre: update status to scheduled or missed
async function centreUpdateStatus(req, res) {
  try {
    const role = req.user?.role;
    if (!['vacc_centre', 'staff'].includes(role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const { id } = req.params;
    const { status } = req.body;
    if (!['scheduled', 'missed'].includes(status)) {
      return res.status(400).json({ message: "status must be 'scheduled' or 'missed'" });
    }
    const appt = await Appointment.findById(id);
    if (!appt) return res.status(404).json({ message: 'Appointment not found' });
    const vc_id = req.user?.vc_id;
    if (vc_id && appt.center_id !== vc_id) {
      return res.status(403).json({ message: 'Forbidden: different centre' });
    }
    appt.status = status;
    await appt.save();
    return res.status(200).json({ message: 'Status updated', id, status });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update status' });
  }
}

// Centre/Staff: mark appointment done via QR text or appointment id
async function markDone(req, res) {
  try {
    const role = req.user?.role;
    if (!['vacc_centre', 'staff'].includes(role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    let { appointment_id, qr_text } = req.body;
    if (!appointment_id && qr_text) {
      try {
        const parsed = JSON.parse(qr_text);
        if (parsed && parsed.type === 'appointment' && parsed.id) {
          appointment_id = parsed.id;
        }
      } catch (_) {
        const prefix = 'appointment:';
        if (qr_text.startsWith(prefix)) {
          appointment_id = qr_text.slice(prefix.length);
        }
      }
    }
    if (!appointment_id) {
      return res.status(400).json({ message: 'Provide appointment_id or qr_text' });
    }
    const appt = await Appointment.findById(appointment_id);
    if (!appt) return res.status(404).json({ message: 'Appointment not found' });
    const vc_id = req.user?.vc_id;
    if (vc_id && appt.center_id !== vc_id) {
      return res.status(403).json({ message: 'Forbidden: different centre' });
    }
    const wasDone = appt.status === 'done';
    appt.status = 'done';
    await appt.save();

    // Update citizen vaccine_taken if this is the first time marking done
    if (!wasDone) {
      try {
        const citizen = await Citizen.findById(appt.citizen_id);
        if (citizen) {
          const entry = {
            vaccine_id: appt.vaccine_id,
            vaccine_name: appt.vaccine_name,
            time_stamp: new Date(),
          };
          citizen.vaccine_taken = Array.isArray(citizen.vaccine_taken) ? citizen.vaccine_taken : [];
          citizen.vaccine_taken.push(entry);
          await citizen.save();
        }
      } catch (citErr) {
        // Log and continue, do not fail the endpoint
        console.error('Failed to update citizen vaccine_taken:', citErr);
      }
    }
    return res.status(200).json({ message: 'Appointment marked done', id: appointment_id });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to mark appointment done' });
  }
}

module.exports = {
  createAppointment,
  getAppointmentsByCitizen,
  getAppointmentsByCitizenAndStatus,
  cancelAppointment,
  getAppointmentsByCentre,
  getAppointmentsByCentreAndStatus,
  getAppointmentsByCentreStatusAndTime,
  centreUpdateStatus,
  markDone,
};