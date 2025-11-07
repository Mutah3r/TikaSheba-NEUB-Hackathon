const mongoose = require('mongoose')

// vaccine_id, vaccine_name,current-stock(number), created_at, total_people, total_dosed, total_wasted
const centreVaccineSchema = new mongoose.Schema({
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
  current_stock: {
    type: Number,
    default: 0,
  },
  requested_stock: {
    type: Number,
    default: 0,
  },
  created_at: {
    type: Date,
    required: true,
  },
  total_people: {
    type: Number,
    default: 0,
  },
  total_dosed: {
    type: Number,
    default: 0,
  },
  total_wasted: {
    type: Number,
    default: 0,
  },
});

const CentreVaccine = mongoose.model('CentreVaccine', centreVaccineSchema);
module.exports = CentreVaccine;



// authority
// add or create center vaccine (centre_id, vaccine_id, vaccine_name)
// delete center vaccine (only this schema id)




