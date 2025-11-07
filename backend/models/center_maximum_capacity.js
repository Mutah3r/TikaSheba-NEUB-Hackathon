const mongoose = require('mongoose');

//name, email, password
const capacity = new mongoose.Schema({
  center_id : {
        type: String,
        required: true,
  },
  capacity : {
        type : Number,
        default : 0,
  }
});

const centerCapacity = mongoose.model('capacity', capacity);
module.exports = centerCapacity;



// get capacity by center_id

// update capacity by center_id
