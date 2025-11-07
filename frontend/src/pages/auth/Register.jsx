import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import OTPModal from "../../components/OTPModal";
import Notification from "../../components/Notification";
import { FiUser, FiFileText, FiPhone, FiHash, FiCalendar, FiUsers } from "react-icons/fi";
import { registerCitizen, verifyCitizenOtp } from "../../services/citizenService";

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [idType, setIdType] = useState("NID");
  const [idNumber, setIdNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [gender, setGender] = useState("Male");
  const [dob, setDob] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const [otpOpen, setOtpOpen] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [submittingOtp, setSubmittingOtp] = useState(false);

  useEffect(() => {
    if (otpOpen && resendSeconds > 0) {
      const t = setTimeout(() => setResendSeconds((s) => Math.max(0, s - 1)), 1000);
      return () => clearTimeout(t);
    }
  }, [otpOpen, resendSeconds]);

  const startOtpFlow = () => {
    setResendSeconds(60);
    setOtpOpen(true);
  };

  const handleResend = () => {
    setResendSeconds(60);
    // Mock resend
  };

  const handleRegister = async () => {
    setError("");
    if (name.trim().length < 2) return setError("Please enter your full name.");
    if (!idNumber.trim()) return setError("Enter your NID/Birth Certificate number.");
    if (!/^\+?\d{10,14}$/.test(phone)) return setError("Enter a valid phone number.");
    if (!registrationNumber.trim()) return setError("Enter your registration number.");
    if (!dob) return setError("Select your date of birth.");

    setSending(true);
    try {
      const payload = {
        name,
        idType,
        idNumber,
        phone,
        registrationNumber,
        gender,
        dob,
      };
      await registerCitizen(payload);
      startOtpFlow();
      setToast({ show: true, type: "success", message: `OTP sent to ${phone}. Enter the code to continue.` });
      setTimeout(() => setToast({ show: false, message: "" }), 4500);
    } catch (err) {
      setError(err?.message || "Could not send OTP. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleOtpSubmit = async (code) => {
    setSubmittingOtp(true);
    try {
      const res = await verifyCitizenOtp({ phone_number: phone, otp: code });
      const token = res?.token;
      const role = res?.role;
      if (!token) throw new Error("Missing token in response");
      localStorage.setItem("auth_token", token);
      if (role) localStorage.setItem("role", role);
      setOtpOpen(false);
      setToast({ show: true, type: "success", message: "Phone verified. Welcome!" });
      setTimeout(() => setToast({ show: false, message: "" }), 3500);
      navigate("/dashboard/citizen");
    } catch (err) {
      setError(err?.message || "Invalid OTP. Try again.");
      setToast({ show: true, type: "notice", message: err?.message || "Could not verify phone." });
      setTimeout(() => setToast({ show: false, message: "" }), 3500);
    } finally {
      setSubmittingOtp(false);
    }
  };

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  return (
    <div className="space-y-6">
      <Notification
        show={toast.show}
        type={toast.type || "success"}
        message={toast.message}
        onClose={() => setToast((t) => ({ ...t, show: false }))}
      />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Citizen Registration</h2>
          <p className="text-sm text-[#0c2b40]/70">Create your account to get started</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="grid gap-2">
          <label className="block text-sm font-medium">Full Name</label>
          <div className="relative">
            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0c2b40]/50" />
            <input
              type="text"
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-[#EAB308]/30 focus:border-[#EAB308] outline-none pl-9 pr-3 py-2"
            />
          </div>
        </div>

        <div className="grid gap-2">
          <label className="block text-sm font-medium">Registration Number</label>
          <div className="relative">
            <FiHash className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0c2b40]/50" />
            <input
              type="text"
              placeholder="e.g. REG-2025-0001"
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
              className="w-full rounded-xl border border-[#EAB308]/30 focus:border-[#EAB308] outline-none pl-9 pr-3 py-2"
            />
          </div>
        </div>

        <div className="grid gap-2">
          <label className="block text-sm font-medium">ID Type</label>
          <div className="flex items-center gap-4">
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="idType"
                value="NID"
                checked={idType === "NID"}
                onChange={(e) => setIdType(e.target.value)}
              />
              NID
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="idType"
                value="Birth Certificate"
                checked={idType === "Birth Certificate"}
                onChange={(e) => setIdType(e.target.value)}
              />
              Birth Certificate
            </label>
          </div>
        </div>

        <div className="grid gap-2">
          <label className="block text-sm font-medium">{idType} Number</label>
          <div className="relative">
            <FiFileText className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0c2b40]/50" />
            <input
              type="text"
              placeholder={idType === "NID" ? "e.g. 1234-5678-9012" : "e.g. BC-123456"}
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              className="w-full rounded-xl border border-[#EAB308]/30 focus:border-[#EAB308] outline-none pl-9 pr-3 py-2"
            />
          </div>
        </div>

        <div className="grid gap-2">
          <label className="block text-sm font-medium">Gender</label>
          <div className="flex items-center gap-4">
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="gender"
                value="Male"
                checked={gender === "Male"}
                onChange={(e) => setGender(e.target.value)}
              />
              <FiUsers /> Male
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="gender"
                value="Female"
                checked={gender === "Female"}
                onChange={(e) => setGender(e.target.value)}
              />
              <FiUsers /> Female
            </label>
          </div>
        </div>

        <div className="grid gap-2">
          <label className="block text-sm font-medium">Date of Birth</label>
          <div className="relative">
            <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0c2b40]/50" />
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full rounded-xl border border-[#EAB308]/30 focus:border-[#EAB308] outline-none pl-9 pr-3 py-2"
            />
          </div>
        </div>

        <div className="grid gap-2">
          <label className="block text-sm font-medium">Phone Number</label>
          <div className="relative">
            <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0c2b40]/50" />
            <input
              type="tel"
              placeholder="e.g. +8801XXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-[#EAB308]/30 focus:border-[#EAB308] outline-none pl-9 pr-3 py-2"
            />
          </div>
        </div>

        {error && <p className="text-sm text-[#F04E36]">{error}</p>}

        <div className="flex items-center justify-end">
          <button
            onClick={handleRegister}
            className="inline-flex items-center gap-2 rounded-xl bg-[#F04E36] text-white px-4 py-2 font-medium hover:bg-[#e3452f] disabled:opacity-50"
            disabled={sending}
          >
            {sending ? "Sending OTP..." : "Register"}
          </button>
        </div>

        <OTPModal
          isOpen={otpOpen}
          onClose={() => setOtpOpen(false)}
          onSubmit={handleOtpSubmit}
          isSubmitting={submittingOtp}
          title="Verify Phone with OTP"
          subtitle={phone ? `Sent to ${phone}` : undefined}
          resendSeconds={resendSeconds}
          onResend={async () => {
            handleResend();
            try {
              await registerCitizen({
                name,
                idType,
                idNumber,
                phone,
                registrationNumber,
                gender,
                dob,
              });
              setToast({ show: true, type: "success", message: `OTP resent to ${phone}.` });
              setTimeout(() => setToast({ show: false, message: "" }), 3500);
            } catch (err) {
              setError(err?.message || "Could not resend OTP.");
              setToast({ show: true, type: "notice", message: err?.message || "Could not resend OTP." });
              setTimeout(() => setToast({ show: false, message: "" }), 3500);
            }
          }}
        />
      </motion.div>
    </div>
  );
};

export default Register;
