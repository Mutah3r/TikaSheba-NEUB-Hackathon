import { AnimatePresence, motion } from "framer-motion";
import { FiCalendar, FiMapPin, FiSend, FiX } from "react-icons/fi";

const ScheduleRequestModal = ({ isOpen, onClose, onConfirm, centre, vaccine }) => {
  const dateStr = centre?.availableDate
    ? new Date(centre.availableDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "-";

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
              className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl ring-1 ring-[#F04E36]/10 overflow-hidden"
            >
              <button
                onClick={onClose}
                className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#F04E36]/10 text-[#F04E36] hover:bg-[#F04E36]/20"
                aria-label="Close"
              >
                <FiX />
              </button>
              <div className="p-5 border-b border-[#081F2E]/10 flex items-center gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAB308]/20 text-[#EAB308]">
                  <FiSend />
                </div>
                <h3 className="text-lg font-semibold text-[#081F2E]">Confirm Schedule Request</h3>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div className="rounded-xl bg-[#081F2E]/5 p-3 ring-1 ring-[#081F2E]/10">
                    <div className="text-sm font-medium text-[#081F2E] flex items-center gap-2">
                      <FiCalendar className="text-[#EAB308]" />
                      Date
                    </div>
                    <div className="text-sm text-[#0c2b40]/80">{dateStr}</div>
                  </div>
                  <div className="rounded-xl bg-[#081F2E]/5 p-3 ring-1 ring-[#081F2E]/10">
                    <div className="text-sm font-medium text-[#081F2E] flex items-center gap-2">
                      <FiMapPin className="text-[#EAB308]" />
                      Centre
                    </div>
                    <div className="text-sm text-[#0c2b40]/80">{centre?.name || "-"}</div>
                    <div className="text-xs text-[#0c2b40]/70">{centre?.address || "-"}</div>
                  </div>
                  <div className="rounded-xl bg-[#081F2E]/5 p-3 ring-1 ring-[#081F2E]/10">
                    <div className="text-sm font-medium text-[#081F2E] flex items-center gap-2">
                      <FiSend className="text-[#EAB308]" />
                      Vaccine
                    </div>
                    <div className="text-sm text-[#0c2b40]/80">{vaccine?.name || "Not selected"}</div>
                    {vaccine ? (
                      <div className="text-xs text-[#0c2b40]/70">Doses: {vaccine.doses}; Recommended: {vaccine.recommendedAge}</div>
                    ) : (
                      <div className="text-xs text-[#0c2b40]/70">Please select a vaccine above.</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={onClose}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#081F2E]/10 text-[#081F2E] px-3 py-2 text-sm font-medium hover:bg-[#081F2E]/15"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onConfirm}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#F04E36] text-white px-3 py-2 text-sm font-semibold hover:bg-[#d7432f]"
                  >
                    <FiSend />
                    Confirm Request
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

export default ScheduleRequestModal;