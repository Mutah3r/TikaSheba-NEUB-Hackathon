import api from "./apiClient";

export function registerCitizen(form) {
  const payload = {
    name: form.name,
    reg_no: form.registrationNumber,
    NID_no: form.idType === "NID" ? form.idNumber : "",
    Birth_Certificate_no:
      form.idType === "Birth Certificate" ? form.idNumber : "",
    NID_or_Birth: form.idType === "NID",
    gender: form.gender,
    DOB: form.dob,
    phone_number: form.phone,
  };
  return api.post("/citizen/register", payload);
}

export function verifyCitizenOtp({ phone_number, otp }) {
  return api.post("/citizen/verify", { phone_number, otp });
}

// Citizen login: request OTP
export function requestCitizenLoginOtp({ phone_number }) {
  return api.post("/citizen/login/request", { phone_number });
}

// Login verify for any user by phone+otp
export function verifyLoginOtp({ phone_number, otp }) {
  return api.post("/citizen/login/verify", { phone_number, otp });
}

export default {
  registerCitizen,
  verifyCitizenOtp,
  requestCitizenLoginOtp,
  verifyLoginOtp,
};
