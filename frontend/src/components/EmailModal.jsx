import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiMail, FiX } from "react-icons/fi";

const EmailModal = ({
  isOpen,
  onClose,
  onSubmit,
  title = "Reset Password",
  subtitle = "Enter your email to receive a reset link",
  isSubmitting = false,
}) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setEmail("");
      setError("");
    }
  }, [isOpen]);

  const isValidEmail = /.+@.+\..+/.test(email);

  const handleSubmit = () => {
    setError("");
    if (!isValidEmail) {
      setError("Please enter a valid email.");
      return;
    }
    onSubmit?.(email);
  };

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
                    <FiMail className="text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{title}</h3>
                    {subtitle && (
                      <p className="text-sm text-[#0c2b40]/70">{subtitle}</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Email</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-[#EAB308]/30 focus:border-[#EAB308] outline-none px-3 py-2"
                  />
                  {error && <p className="text-sm text-[#F04E36]">{error}</p>}
                </div>

                <div className="flex items-center justify-end mt-4">
                  <button
                    onClick={handleSubmit}
                    disabled={!isValidEmail || isSubmitting}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#F04E36] text-white px-4 py-2 font-medium hover:bg-[#e3452f] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Sending..." : "Send Reset Link"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EmailModal;