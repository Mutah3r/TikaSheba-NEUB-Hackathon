import { motion } from "framer-motion";
import { FiUsers, FiTrendingUp, FiClipboard } from "react-icons/fi";

const CentreDashboard = () => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 22 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="rounded-2xl bg-white shadow ring-1 ring-[#F04E36]/10 p-5">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#F04E36]/10 text-[#F04E36] mb-3">
            <FiUsers />
          </div>
          <p className="text-sm text-[#0c2b40]/70">Citizens in Queue</p>
          <p className="text-lg font-semibold">18</p>
        </div>
        <div className="rounded-2xl bg-white shadow ring-1 ring-[#EAB308]/20 p-5">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAB308]/10 text-[#EAB308] mb-3">
            <FiTrendingUp />
          </div>
          <p className="text-sm text-[#0c2b40]/70">Today’s Vaccinations</p>
          <p className="text-lg font-semibold">112</p>
        </div>
        <div className="rounded-2xl bg-white shadow ring-1 ring-[#081F2E]/10 p-5">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#081F2E]/10 text-[#081F2E] mb-3">
            <FiClipboard />
          </div>
          <p className="text-sm text-[#0c2b40]/70">Pending Reports</p>
          <p className="text-lg font-semibold">5</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 22 }}
        className="rounded-2xl bg-white shadow ring-1 ring-[#F04E36]/10 p-6"
      >
        <h2 className="text-xl font-bold mb-2">Centre Overview</h2>
        <p className="text-sm text-[#0c2b40]/80">
          Manage queues, track vaccinations, and review operational insights.
        </p>
      </motion.div>
    </div>
  );
};

export default CentreDashboard;