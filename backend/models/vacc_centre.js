const mongoose = require('mongoose');

//name, location, district, lattitude, longitude, vc_id, password, staffs[id, name, password]

const vacc_centreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  district: {
    type: String,
    required: true,
  },
  lattitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  vc_id: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  staffs: [
    {
      id: { type: String, required: true },
      name: { type: String, required: true },
      password: { type: String, required: true },
    }
  ]
});

const Vacc_centre = mongoose.model('Vacc_centre', vacc_centreSchema);
module.exports = Vacc_centre;




// Authority:
// create vaccine centre (all id, except stuff, which is initially zero)
// update vaccine centre (all id, except stuff can be updated)



