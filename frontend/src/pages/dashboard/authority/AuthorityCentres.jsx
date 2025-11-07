import { motion } from "framer-motion";
import { FiUsers } from "react-icons/fi";

const CENTRES = [
  { id: "c1", name: "Dhaka Medical Centre", district: "Dhaka", status: "Online" },
  { id: "c2", name: "Chittagong Urban Clinic", district: "Chattogram", status: "Online" },
  { id: "c3", name: "Rajshahi Health Point", district: "Rajshahi", status: "Offline" },
  { id: "c4", name: "Sylhet Vaccination Hub", district: "Sylhet", status: "Online" },
];

const AuthorityCentres = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#081F2E]/15 text-[#081F2E] ring-1 ring-[#081F2E]/25">
          <FiUsers />
        </div>
        <h2 className="text-xl font-semibold text-[#081F2E]">Vaccine Centres</h2>
      </div>

      <div className="rounded-2xl bg-white/70 backdrop-blur-md shadow-sm ring-1 ring-[#081F2E]/10 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CENTRES.map((c, idx) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="rounded-2xl p-5 shadow-sm ring-1 bg-gradient-to-br from-[#F8FAFF] via-white to-[#EFF6FF] ring-[#081F2E]/10">
              <div className="text-[#081F2E] font-semibold">{c.name}</div>
              <div className="text-xs text-[#0c2b40]/80">{c.district}</div>
              <div className="mt-3 inline-flex items-center gap-2 text-xs rounded-md px-2 py-1 ring-1 ring-[#081F2E]/15 bg-[#E9F9EE] text-[#1a8a35]">
                {c.status}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default AuthorityCentres;