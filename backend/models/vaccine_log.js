const mongoose = require('mongoose');

//centre_id, vaccine_id, vaccine_name, staff_id, date, people_dosed, dose_used, dose_wasted
const vaccineLogSchema = new mongoose.Schema({
  centre_id: {
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
  staff_id: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  people_dosed: {
    type: Number,
    default: 0,
  },
  dose_used: {
    type: Number,
    default: 0,
  },
  dose_wasted: {
    type: Number,
    default: 0,
  },
});

const VaccineLog = mongoose.model('VaccineLog', vaccineLogSchema);
module.exports = VaccineLog;
