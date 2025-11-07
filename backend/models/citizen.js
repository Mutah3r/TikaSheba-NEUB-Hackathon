const mongoose = require('mongoose');

//name, NID no, Birth Certificate no, NID/BIRTH?(boolean which one choose), gender, DOB, phone-number, otp?

const citizenSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
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
    type: Boolean,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  DOB: {
    type: Date,
    required: true,
  },
  phone_number: {
    type: String,
    required: true,
  },
  otp: {
    type: String
  },
});

const Citizen = mongoose.model('Citizen', citizenSchema);
module.exports = Citizen;