import { motion } from "framer-motion";
import { FiActivity } from "react-icons/fi";

const CitizenLogs = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="rounded-2xl bg-white/70 backdrop-blur-md shadow-sm ring-1 ring-[#081F2E]/10 p-6"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAB308]/20 text-[#EAB308] ring-1 ring-[#EAB308]/30">
          <FiActivity />
        </div>
        <h2 className="text-xl font-semibold text-[#081F2E]">Logs</h2>
      </div>
      <p className="text-[#0c2b40]/80">
        Track activity and notifications related to your vaccination journey.
        This placeholder can later display system and appointment logs.
      </p>
    </motion.section>
  );
};

export default CitizenLogs;