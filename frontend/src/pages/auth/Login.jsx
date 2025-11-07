import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiHelpCircle,
  FiHome,
  FiLock,
  FiMail,
  FiPhone,
  FiShield,
} from "react-icons/fi";
import { useNavigate } from "react-router";
import OTPModal from "../../components/OTPModal";
import EmailModal from "../../components/EmailModal";
import Notification from "../../components/Notification";
import { requestCitizenLoginOtp, verifyLoginOtp } from "../../services/citizenService";
import { authorityLogin } from "../../services/authorityService";
import { centreLogin } from "../../services/centreService";

const TABS = [
  { key: "citizen", label: "Citizen", icon: FiPhone },
  { key: "centre", label: "Centre", icon: FiHome },
  { key: "authority", label: "Authority", icon: FiShield },
];

const Login = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("citizen");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");  const [centreId, setCentreId] = useState("");
  const [password, setPassword] = useState("");
  const [otpOpen, setOtpOpen] = useState(false);
  const [submittingOtp, setSubmittingOtp] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [error, setError] = useState("");
  const containerRef = useRef(null);
  const tabRefs = useRef([]);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, height: 40 });
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "" });
  const [credentialSubmitting, setCredentialSubmitting] = useState(false);

  const tabIndex = useMemo(
    () => TABS.findIndex((t) => t.key === activeTab),
    [activeTab]
  );

  const handleSendOtp = async () => {
    setError("");
    if (!/^\+?\d{10,14}$/.test(phone)) {
      setError("Please enter a valid phone number.");
      return;
    }
    try {
      setSendingOtp(true);
      await requestCitizenLoginOtp({ phone_number: phone });
      setOtpOpen(true);
      setToast({ show: true, message: `OTP sent to ${phone}. Enter the code to continue.` });
      setTimeout(() => setToast({ show: false, message: "" }), 4500);
    } catch (err) {
      setError(err?.message || "Could not send OTP. Please try again.");
    } finally {
      setSendingOtp(false);
    }
  };

  // Measure active tab to place indicator precisely
  useEffect(() => {
    const updateIndicator = () => {
      const idx = tabIndex;
      const el = tabRefs.current[idx];
      const containerEl = containerRef.current;
      if (!el || !containerEl) return;
      const left = el.offsetLeft;
      const width = el.offsetWidth;
      const height = el.offsetHeight;
      setIndicator({ left, width, height });
    };
    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [tabIndex]);

  const handleOtpSubmit = async (code) => {
    setSubmittingOtp(true);
    try {
      const res = await verifyLoginOtp({ phone_number: phone, otp: code });
      const token = res?.token;
      if (token) localStorage.setItem("auth_token", token);
      localStorage.setItem("role", "citizen");
      setOtpOpen(false);
      setToast({ show: true, message: "Logged in successfully." });
      setTimeout(() => setToast({ show: false, message: "" }), 3500);
      navigate("/dashboard/citizen");
    } catch (err) {
      setError(err?.message || "Invalid OTP. Try again.");
    } finally {
      setSubmittingOtp(false);
    }
  };

  const handleCredentialLogin = async () => {
    setError("");

    if (activeTab === "authority") {
      const validEmail = /.+@.+\..+/.test(email);
      if (!validEmail || password.length < 4) {
        setError("Check your email and password.");
        return;
      }
      try {
        setCredentialSubmitting(true);
        const res = await authorityLogin({ email, password });
        const token = res?.token;
        if (token) localStorage.setItem("auth_token", token);
        localStorage.setItem("role", "authority");
        setToast({ show: true, message: "Logged in successfully." });
        setTimeout(() => setToast({ show: false, message: "" }), 3500);
        navigate("/dashboard/authority");
      } catch (err) {
        setError(err?.message || "Invalid credentials. Please try again.");
      } finally {
        setCredentialSubmitting(false);
      }
    } else if (activeTab === "centre") {
      if (!centreId || password.length < 4) {
        setError("Enter your Centre ID and password.");
        return;
      }
      try {
        setCredentialSubmitting(true);
        const res = await centreLogin({ vc_id: centreId, password });
        const token = res?.token;
        const roleResp = res?.role;
        if (token) localStorage.setItem("auth_token", token);
        // Normalize centre role to 'vacc_centre' (accept legacy values)
        const appRole =
          roleResp === "vacc_centre"
            ? "vacc_centre"
            : roleResp === "vcc_centre"
            ? "vacc_centre"
            : roleResp === "centre"
            ? "vacc_centre"
            : "vacc_centre";
        localStorage.setItem("role", appRole);
        setToast({ show: true, message: "Logged in successfully." });
        setTimeout(() => setToast({ show: false, message: "" }), 3500);
        navigate("/dashboard/centre");
      } catch (err) {
        setError(err?.message || "Invalid credentials. Please try again.");
      } finally {
        setCredentialSubmitting(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <Notification
        show={toast.show}
        type="success"
        message={toast.message}
        onClose={() => setToast({ show: false, message: "" })}
      />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Login</h2>
          <p className="text-sm text-[#0c2b40]/70">
            Choose your role and continue
          </p>
        </div>
      </div>

      <div className="relative">
        <div
          ref={containerRef}
          className="relative grid grid-cols-3 gap-2 rounded-xl bg-[#081F2E]/5 p-1"
        >
          {TABS.map((tab, i) => (
            <button
              key={tab.key}
              ref={(el) => (tabRefs.current[i] = el)}
              onClick={() => setActiveTab(tab.key)}
              className={`relative z-10 inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                activeTab === tab.key ? "text-[#081F2E]" : "text-[#0c2b40]/70"
              }`}
            >
              <tab.icon />
              {tab.label}
            </button>
          ))}
          <motion.div
            className="absolute top-1 left-1 rounded-lg bg-white shadow ring-1 ring-[#F04E36]/20"
            initial={false}
            animate={{
              x: indicator.left,
              width: indicator.width,
              height: indicator.height,
            }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
          />
        </div>
      </div>

      {/* Content */}
      {activeTab === "citizen" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
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
              disabled={sendingOtp}
              className="inline-flex items-center gap-2 rounded-xl bg-[#F04E36] text-white px-4 py-2 font-medium hover:bg-[#e3452f] disabled:opacity-50"
            >
              <FiPhone /> {sendingOtp ? "Sending..." : "Send OTP"}
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
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="grid gap-3">
            <label className="block text-sm font-medium">Vaccination Centre ID</label>
            <div className="relative">
              <FiHome className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0c2b40]/50" />
              <input
                type="text"
                placeholder="e.g. VC-000123"
                value={centreId}
                onChange={(e) => setCentreId(e.target.value)}
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
              onClick={() => setForgotOpen(true)}
              className="inline-flex items-center gap-1 text-sm text-[#081F2E] hover:underline"
            >
              <FiHelpCircle /> Forgot password?
            </button>
            <button
              onClick={handleCredentialLogin}
              disabled={credentialSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-[#F04E36] text-white px-4 py-2 font-medium hover:bg-[#e3452f] disabled:opacity-50"
            >
              {credentialSubmitting ? "Logging in..." : "Login"}
            </button>
          </div>
        </motion.div>
      )}

      {activeTab === "authority" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
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
              onClick={() => setForgotOpen(true)}
              className="inline-flex items-center gap-1 text-sm text-[#081F2E] hover:underline"
            >
              <FiHelpCircle /> Forgot password?
            </button>
            <button
              onClick={handleCredentialLogin}
              disabled={credentialSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-[#F04E36] text-white px-4 py-2 font-medium hover:bg-[#e3452f] disabled:opacity-50"
            >
              {credentialSubmitting ? "Logging in..." : "Login"}
            </button>
          </div>
        </motion.div>
      )}
      <EmailModal
        isOpen={forgotOpen}
        onClose={() => setForgotOpen(false)}
        isSubmitting={forgotSubmitting}
        onSubmit={(email) => {
          setForgotSubmitting(true);
          setTimeout(() => {
            setForgotSubmitting(false);
            setForgotOpen(false);
            setToast({
              show: true,
              message: `Password reset link has been sent to ${email}. Please check your inbox.`,
            });
            setTimeout(() => setToast({ show: false, message: "" }), 4500);
          }, 900);
        }}
        title="Forgot Password"
        subtitle="Enter your email to receive a reset link"
      />
    </div>
  );
};

export default Login;
