const mongoose = require('mongoose');

//centre_id, vaccine_id, vaccine_name, staff_id, date, people_dosed, dose_used, dose_wasted
const vaccineLogSchema = new mongoose.Schema({
  citizen_id: {
    type: String,
    require: true,
  },
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
});

const VaccineLog = mongoose.model('VaccineLog', vaccineLogSchema);
module.exports = VaccineLog;





//stuff:
// create log

// center
// get all log by center id
// get all vaccine log by stuff id


//citizen
// get all log by citizen id

///api will make in vaccine.js



