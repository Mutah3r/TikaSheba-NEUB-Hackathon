import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import OTPModal from "../../components/OTPModal";
import { FiUser, FiFileText, FiPhone } from "react-icons/fi";

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [idType, setIdType] = useState("NID");
  const [idNumber, setIdNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

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

  const handleRegister = () => {
    setError("");
    if (name.trim().length < 2) return setError("Please enter your full name.");
    if (!idNumber.trim()) return setError("Enter your NID/Birth Certificate number.");
    if (!/^\+?\d{10,14}$/.test(phone)) return setError("Enter a valid phone number.");
    // Mock submit: open OTP
    setTimeout(() => startOtpFlow(), 300);
  };

  const handleOtpSubmit = (code) => {
    setSubmittingOtp(true);
    setTimeout(() => {
      setSubmittingOtp(false);
      if (code === "1234") {
        setOtpOpen(false);
        alert("Registration successful! Please login.");
        navigate("/auth/login");
      } else {
        setError("Invalid OTP. Try again.");
      }
    }, 800);
  };

  return (
    <div className="space-y-6">
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
            className="inline-flex items-center gap-2 rounded-xl bg-[#F04E36] text-white px-4 py-2 font-medium hover:bg-[#e3452f]"
          >
            Register
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
          onResend={handleResend}
        />
      </motion.div>
    </div>
  );
};

export default Register;
