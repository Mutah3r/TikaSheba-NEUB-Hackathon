import { motion } from "framer-motion";
import { FiCalendar, FiPhone, FiCheckCircle } from "react-icons/fi";

const CitizenDashboard = () => {
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
            <FiCheckCircle />
          </div>
          <p className="text-sm text-[#0c2b40]/70">Vaccination Status</p>
          <p className="text-lg font-semibold">Up to date</p>
        </div>
        <div className="rounded-2xl bg-white shadow ring-1 ring-[#EAB308]/20 p-5">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAB308]/10 text-[#EAB308] mb-3">
            <FiCalendar />
          </div>
          <p className="text-sm text-[#0c2b40]/70">Next Appointment</p>
          <p className="text-lg font-semibold">24 Nov, 10:30 AM</p>
        </div>
        <div className="rounded-2xl bg-white shadow ring-1 ring-[#081F2E]/10 p-5">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#081F2E]/10 text-[#081F2E] mb-3">
            <FiPhone />
          </div>
          <p className="text-sm text-[#0c2b40]/70">Support</p>
          <p className="text-lg font-semibold">+8801XXXXXXXXX</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 22 }}
        className="rounded-2xl bg-white shadow ring-1 ring-[#F04E36]/10 p-6"
      >
        <h2 className="text-xl font-bold mb-2">Welcome to your Citizen Dashboard</h2>
        <p className="text-sm text-[#0c2b40]/80">
          Track your vaccination records, upcoming appointments, and manage your profile.
        </p>
      </motion.div>
    </div>
  );
};

export default CitizenDashboard;