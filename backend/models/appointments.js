const mongoose = require('mongoose');

// citizen_id,vaccine_id, vaccine_name, center_id, date, time, status-(requested, scheduled, done, cancelled, missed), qr_url

const appointmentSchema = new mongoose.Schema({
  citizen_id: {
    type: String,
    required: true,
  },
  vaccine_id: {
    type: String,
    required: true,
  },
  vaccine_name: {
    type: String,
    required: true,
  },
  center_id: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  qr_url: {
    type: String,
  },
});

const Appointment = mongoose.model('Appointment', appointmentSchema);
module.exports = Appointment;
