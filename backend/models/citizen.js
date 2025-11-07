const mongoose = require('mongoose');

//name, NID no, Birth Certificate no, NID/BIRTH?(boolean which one choose), gender, DOB, phone-number, otp?

const citizenSchema = new mongoose.Schema({
  name: {
    type: String
  },
  reg_no: {
    type: String,
    required: true,
  },
  NID_no: {
    type: String,
  },
  Birth_Certificate_no: {
    type: String,
  },
  NID_or_Birth: {
    type: Boolean
  },
  gender: {
    type: String
  },
  DOB: {
    type: Date
  },
  phone_number: {
    type: String
  },
  otp: {
    type: String
  },
  vaccine_taken : [
    {
        vaccine_id: {
            type: String,
            required: true,
          },
          vaccine_name: {
            type: String,
            required: true,
          },
          time_stamp: {
            type: Date,
            require: true
          }
    }
  ],
  vaccine_certificate_qr : {
    type: String,
  }
  
});

const Citizen = mongoose.model('Citizen', citizenSchema);
module.exports = Citizen;

//citizen:
// update citizen info api (basic info, like name, gender, phone number)

//anyone:
//qr scan- get vaccine list of citizen and send otp to this phone

//citizen:staff:
// get vaccine taken, (format it to vaccine_name, dose_count (vaccine_taken for this vaccine_id), last_date of taken vaccine)