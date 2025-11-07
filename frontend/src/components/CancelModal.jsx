import { AnimatePresence, motion } from "framer-motion";
import { FiAlertTriangle, FiX } from "react-icons/fi";

const CancelModal = ({
  isOpen,
  onClose,
  onConfirm,
  centre,
  date,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/35" onClick={onClose} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
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

              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#F04E36]/10 text-[#F04E36]">
                    <FiAlertTriangle className="text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Cancel Appointment</h3>
                    <p className="text-xs text-[#0c2b40]/70">Please review before proceeding</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-[#0c2b40]/80">
                  <p>
                    Are you sure you want to cancel your vaccine appointment at
                    <span className="font-semibold"> {centre} </span>
                    scheduled on <span className="font-semibold">{date}</span>?
                  </p>
                  <p className="text-[#F04E36]">This action cannot be undone.</p>
                </div>

                <div className="mt-5 flex items-center justify-end gap-3">
                  <button
                    onClick={onClose}
                    className="rounded-xl px-4 py-2 text-sm bg-[#081F2E]/5 text-[#081F2E] hover:bg-[#081F2E]/10"
                  >
                    Keep Schedule
                  </button>
                  <button
                    onClick={onConfirm}
                    className="rounded-xl px-4 py-2 text-sm bg-[#F04E36] text-white hover:bg-[#e04631]"
                  >
                    Cancel Appointment
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

export default CancelModal;