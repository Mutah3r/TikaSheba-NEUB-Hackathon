import { AnimatePresence, motion } from "framer-motion";
import { FiCheckCircle, FiXCircle, FiX } from "react-icons/fi";

const Notification = ({
  show,
  type = "success",
  message,
  onClose,
}) => {
  const isSuccess = type === "success";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ type: "spring", stiffness: 280, damping: 20 }}
          className="fixed top-4 right-4 z-[60]"
        >
          <div className={`relative flex items-start gap-3 rounded-xl px-4 py-3 shadow-lg ring-1 ${isSuccess ? "bg-white ring-[#2FC94E]/20" : "bg-white ring-[#F04E36]/20"}`}>
            <div className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${isSuccess ? "bg-[#2FC94E]/10 text-[#2FC94E]" : "bg-[#F04E36]/10 text-[#F04E36]"}`}>
              {isSuccess ? <FiCheckCircle /> : <FiXCircle />}
            </div>
            <div>
              <p className="text-sm font-medium text-[#081F2E]">{isSuccess ? "Success" : "Notice"}</p>
              <p className="text-sm text-[#0c2b40]/80">{message}</p>
            </div>
            <button
              onClick={onClose}
              className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/5 text-[#081F2E] hover:bg-black/10"
            >
              <FiX />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Notification;