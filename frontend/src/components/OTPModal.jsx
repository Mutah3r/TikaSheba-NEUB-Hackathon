import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiKey, FiClock, FiRefreshCcw, FiX } from "react-icons/fi";

const OTPModal = ({
  isOpen,
  onClose,
  onSubmit,
  title = "Enter OTP",
  subtitle,
  isSubmitting = false,
  resendSeconds = 0,
  onResend,
  digits = 4,
}) => {
  const [vals, setVals] = useState(Array(digits).fill(""));
  const inputsRef = useRef([]);

  useEffect(() => {
    if (isOpen) {
      setVals(Array(digits).fill(""));
      // focus first after open
      setTimeout(() => inputsRef.current[0]?.focus(), 150);
    }
  }, [isOpen, digits]);

  const code = useMemo(() => vals.join(""), [vals]);

  const handleChange = (i, e) => {
    const v = e.target.value.replace(/\D/g, "");
    setVals((prev) => {
      const next = [...prev];
      next[i] = v.slice(-1);
      return next;
    });
    if (v && i < digits - 1) inputsRef.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !vals[i] && i > 0) {
      inputsRef.current[i - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && i > 0) inputsRef.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < digits - 1) inputsRef.current[i + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, digits);
    if (!text) return;
    setVals(Array.from(text.padEnd(digits, "").slice(0, digits)));
  };

  const canSubmit = code.length === digits;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/30" onClick={onClose} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 240, damping: 22 }}
              className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-[#F04E36]/10"
            >
              <button
                onClick={onClose}
                className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#F04E36]/10 text-[#F04E36] hover:bg-[#F04E36]/20"
                aria-label="Close"
              >
                <FiX />
              </button>

              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#F04E36]/10 text-[#F04E36]">
                    <FiKey className="text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{title}</h3>
                    {subtitle && (
                      <p className="text-sm text-[#0c2b40]/70">{subtitle}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3 mb-5" onPaste={handlePaste}>
                  {Array.from({ length: digits }).map((_, i) => (
                    <input
                      key={i}
                      ref={(el) => (inputsRef.current[i] = el)}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={vals[i]}
                      onChange={(e) => handleChange(i, e)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      className="h-12 text-center rounded-xl border border-[#EAB308]/30 focus:border-[#EAB308] outline-none text-lg tracking-widest"
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => onSubmit(code)}
                    disabled={!canSubmit || isSubmitting}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#F04E36] text-white px-4 py-2 font-medium hover:bg-[#e3452f] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </button>

                  {typeof onResend === "function" && (
                    <button
                      onClick={onResend}
                      disabled={resendSeconds > 0}
                      className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[#081F2E] bg-[#EAB308]/20 hover:bg-[#EAB308]/30 disabled:opacity-60"
                    >
                      <FiRefreshCcw />
                      {resendSeconds > 0 ? (
                        <span className="inline-flex items-center gap-1">
                          <FiClock /> Resend in {resendSeconds}s
                        </span>
                      ) : (
                        <span>Resend OTP</span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OTPModal;