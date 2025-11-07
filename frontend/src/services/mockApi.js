const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function registerCitizenMock(payload) {
  await delay(800);

  const required = ["name", "idType", "idNumber", "phone"];
  const missing = required.filter((k) => !payload?.[k]);
  if (missing.length) {
    return {
      success: false,
      message: `Missing fields: ${missing.join(", ")}`,
    };
  }

  const userId = `CIT-${Math.floor(100000 + Math.random() * 900000)}`;
  const otpCode = "1234"; // aligned with UI mock

  return {
    success: true,
    message: "Registration initiated. OTP sent to phone.",
    userId,
    otpSent: true,
    otpCode,
  };
}

export default { registerCitizenMock };