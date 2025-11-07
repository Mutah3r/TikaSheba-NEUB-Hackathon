const mongoose = require('mongoose');

//name, email, password
const authoritySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const Authority = mongoose.model('Authority', authoritySchema);
module.exports = Authority;



// create authoritiy

// update authority