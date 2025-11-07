import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import OTPModal from "../../components/OTPModal";
import { FiPhone, FiHome, FiShield, FiMail, FiLock, FiHelpCircle } from "react-icons/fi";

const TABS = [
  { key: "citizen", label: "Citizen", icon: FiPhone },
  { key: "centre", label: "Centre", icon: FiHome },
  { key: "authority", label: "Authority", icon: FiShield },
];

const Login = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("citizen");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpOpen, setOtpOpen] = useState(false);
  const [submittingOtp, setSubmittingOtp] = useState(false);
  const [error, setError] = useState("");

  const tabIndex = useMemo(() => TABS.findIndex((t) => t.key === activeTab), [activeTab]);

  const handleSendOtp = () => {
    setError("");
    if (!/^\+?\d{10,14}$/.test(phone)) {
      setError("Please enter a valid phone number.");
      return;
    }
    // Mock sending OTP
    setTimeout(() => setOtpOpen(true), 300);
  };

  const handleOtpSubmit = (code) => {
    setSubmittingOtp(true);
    // Mock verify OTP (accept 1234)
    setTimeout(() => {
      setSubmittingOtp(false);
      if (code === "1234") {
        setOtpOpen(false);
        navigate("/");
      } else {
        setError("Invalid OTP. Try again.");
      }
    }, 800);
  };

  const handleCredentialLogin = () => {
    setError("");
    const validEmail = /.+@.+\..+/.test(email);
    if (!validEmail || password.length < 4) {
      setError("Check your email and password.");
      return;
    }
    // Mock login
    setTimeout(() => navigate("/"), 700);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Login</h2>
          <p className="text-sm text-[#0c2b40]/70">Choose your role and continue</p>
        </div>
      </div>

      <div className="relative">
        <div className="grid grid-cols-3 gap-2 rounded-xl bg-[#081F2E]/5 p-1">
          {TABS.map((tab, i) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative z-10 inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                activeTab === tab.key ? "text-[#081F2E]" : "text-[#0c2b40]/70"
              }`}
            >
              <tab.icon />
              {tab.label}
            </button>
          ))}
        </div>
        <motion.div
          className="absolute top-1 left-1 h-10 rounded-lg bg-white shadow ring-1 ring-[#F04E36]/20"
          initial={false}
          animate={{ x: tabIndex * (100 + 8) }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          style={{ width: 100 }}
        />
      </div>

      {/* Content */}
      {activeTab === "citizen" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <label className="block text-sm font-medium">Phone Number</label>
          <input
            type="tel"
            placeholder="e.g. +8801XXXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-xl border border-[#EAB308]/30 focus:border-[#EAB308] outline-none px-3 py-2"
          />
          {error && <p className="text-sm text-[#F04E36]">{error}</p>}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSendOtp}
              className="inline-flex items-center gap-2 rounded-xl bg-[#F04E36] text-white px-4 py-2 font-medium hover:bg-[#e3452f]"
            >
              <FiPhone /> Send OTP
            </button>
          </div>
          <OTPModal
            isOpen={otpOpen}
            onClose={() => setOtpOpen(false)}
            onSubmit={handleOtpSubmit}
            isSubmitting={submittingOtp}
            title="Enter 4-digit OTP"
            subtitle={phone ? `Sent to ${phone}` : undefined}
          />
        </motion.div>
      )}

      {activeTab === "centre" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="grid gap-3">
            <label className="block text-sm font-medium">Email</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0c2b40]/50" />
              <input
                type="email"
                placeholder="centre@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-[#EAB308]/30 focus:border-[#EAB308] outline-none pl-9 pr-3 py-2"
              />
            </div>
          </div>
          <div className="grid gap-3">
            <label className="block text-sm font-medium">Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0c2b40]/50" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-[#EAB308]/30 focus:border-[#EAB308] outline-none pl-9 pr-3 py-2"
              />
            </div>
          </div>
          {error && <p className="text-sm text-[#F04E36]">{error}</p>}
          <div className="flex items-center justify-between">
            <button
              onClick={() => alert("Password reset link sent to your email.")}
              className="inline-flex items-center gap-1 text-sm text-[#081F2E] hover:underline"
            >
              <FiHelpCircle /> Forgot password?
            </button>
            <button
              onClick={handleCredentialLogin}
              className="inline-flex items-center gap-2 rounded-xl bg-[#F04E36] text-white px-4 py-2 font-medium hover:bg-[#e3452f]"
            >
              Login
            </button>
          </div>
        </motion.div>
      )}

      {activeTab === "authority" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="grid gap-3">
            <label className="block text-sm font-medium">Email</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0c2b40]/50" />
              <input
                type="email"
                placeholder="authority@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-[#EAB308]/30 focus:border-[#EAB308] outline-none pl-9 pr-3 py-2"
              />
            </div>
          </div>
          <div className="grid gap-3">
            <label className="block text-sm font-medium">Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0c2b40]/50" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-[#EAB308]/30 focus:border-[#EAB308] outline-none pl-9 pr-3 py-2"
              />
            </div>
          </div>
          {error && <p className="text-sm text-[#F04E36]">{error}</p>}
          <div className="flex items-center justify-between">
            <button
              onClick={() => alert("Password reset link sent to your email.")}
              className="inline-flex items-center gap-1 text-sm text-[#081F2E] hover:underline"
            >
              <FiHelpCircle /> Forgot password?
            </button>
            <button
              onClick={handleCredentialLogin}
              className="inline-flex items-center gap-2 rounded-xl bg-[#F04E36] text-white px-4 py-2 font-medium hover:bg-[#e3452f]"
            >
              Login
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Login;
