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
    enum: ['requested', 'scheduled', 'done', 'cancelled', 'missed'], // if time < current time : then status is "missed"
    default: 'requested',
  },
  qr_url: {
    type: String,
  },
});

const Appointment = mongoose.model('Appointment', appointmentSchema);
module.exports = Appointment;







// citizen:
// create appointment
// get all vaccine appointment by citizen id 
// get all vaccine appointment by citizen id and status- separate api
// update status (only to cancelled)



// vaccine center:
// get all vaccine appointment by center id 
// get all vaccine appointment by center id and status and time
// update status (requested to scheduled to done.),  done status will be using QR or appointment id.










