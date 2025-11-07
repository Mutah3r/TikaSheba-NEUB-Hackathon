import { motion } from "framer-motion";
import { FiShield, FiBarChart2, FiFileText } from "react-icons/fi";

const AuthorityDashboard = () => {
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
            <FiShield />
          </div>
          <p className="text-sm text-[#0c2b40]/70">Centres Online</p>
          <p className="text-lg font-semibold">42</p>
        </div>
        <div className="rounded-2xl bg-white shadow ring-1 ring-[#EAB308]/20 p-5">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAB308]/10 text-[#EAB308] mb-3">
            <FiBarChart2 />
          </div>
          <p className="text-sm text-[#0c2b40]/70">Daily Coverage</p>
          <p className="text-lg font-semibold">78%</p>
        </div>
        <div className="rounded-2xl bg-white shadow ring-1 ring-[#081F2E]/10 p-5">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#081F2E]/10 text-[#081F2E] mb-3">
            <FiFileText />
          </div>
          <p className="text-sm text-[#0c2b40]/70">New Reports</p>
          <p className="text-lg font-semibold">9</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 22 }}
        className="rounded-2xl bg-white shadow ring-1 ring-[#F04E36]/10 p-6"
      >
        <h2 className="text-xl font-bold mb-2">Authority Dashboard</h2>
        <p className="text-sm text-[#0c2b40]/80">
          Monitor centre operations, coverage metrics, and regulatory reports.
        </p>
      </motion.div>
    </div>
  );
};

export default AuthorityDashboard;