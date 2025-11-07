const mongoose = require('mongoose');

// name, description

const vaccineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

const Vaccine = mongoose.model('Vaccine', vaccineSchema);
module.exports = Vaccine;
