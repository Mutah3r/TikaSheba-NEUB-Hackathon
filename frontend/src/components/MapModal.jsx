import { AnimatePresence, motion } from "framer-motion";
import { FiMapPin, FiX } from "react-icons/fi";

const MapModal = ({ isOpen, onClose, lat = 23.8103, lng = 90.4125, title = "Centre Location" }) => {
  const src = `https://maps.google.com/maps?q=${lat},${lng}&hl=en&z=15&output=embed`;
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
              className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl ring-1 ring-[#F04E36]/10 overflow-hidden"
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
                  <FiMapPin />
                </div>
                <h3 className="text-lg font-semibold text-[#081F2E]">{title}</h3>
              </div>
              <div className="p-5">
                <div className="rounded-xl overflow-hidden ring-1 ring-[#081F2E]/10">
                  <iframe title="Google Map" src={src} className="w-full h-[420px] border-0" allowFullScreen loading="lazy" />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MapModal;