import { motion, AnimatePresence } from "framer-motion";
import { FiClipboard, FiSend, FiCheckCircle } from "react-icons/fi";

const REQUESTS = [
  { id: "r1", centre: "Dhaka Medical Centre", vaccine: "COVID-19 Booster", amount: 500, status: "Pending", date: "2025-11-28" },
  { id: "r2", centre: "Chittagong Urban Clinic", vaccine: "Hepatitis B", amount: 300, status: "Approved", date: "2025-11-27" },
  { id: "r3", centre: "Rajshahi Health Point", vaccine: "Influenza Seasonal", amount: 200, status: "Rejected", date: "2025-11-26" },
];

const AuthorityStockRequests = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#081F2E]/15 text-[#081F2E] ring-1 ring-[#081F2E]/25">
          <FiClipboard />
        </div>
        <h2 className="text-xl font-semibold text-[#081F2E]">Stock Requests</h2>
      </div>

      <div className="rounded-2xl bg-white/70 backdrop-blur-md shadow-sm ring-1 ring-[#081F2E]/10 p-6">
        <div className="rounded-xl bg-white ring-1 ring-[#081F2E]/10 overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-[#081F2E]/5">
              <tr>
                <th className="text-left text-xs font-semibold text-[#081F2E] px-4 py-3">Centre</th>
                <th className="text-left text-xs font-semibold text-[#081F2E] px-4 py-3">Vaccine</th>
                <th className="text-left text-xs font-semibold text-[#081F2E] px-4 py-3">Amount</th>
                <th className="text-left text-xs font-semibold text-[#081F2E] px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-[#081F2E] px-4 py-3">Date</th>
              </tr>
            </thead>
            <AnimatePresence>
              <motion.tbody initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="divide-y divide-[#081F2E]/10">
                {REQUESTS.map((r, idx) => {
                  const badgeClass =
                    r.status === "Pending"
                      ? "bg-[#EAB308]/15 text-[#A05A00] ring-[#EAB308]/30"
                      : r.status === "Approved"
                      ? "bg-[#2FC94E]/15 text-[#1a8a35] ring-[#2FC94E]/30"
                      : "bg-[#F04E36]/15 text-[#8a2e20] ring-[#F04E36]/30";
                  return (
                    <motion.tr key={r.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }} className="hover:bg-[#081F2E]/3">
                      <td className="px-4 py-3 text-[#081F2E] font-medium">{r.centre}</td>
                      <td className="px-4 py-3 text-[#0c2b40]">{r.vaccine}</td>
                      <td className="px-4 py-3 text-[#0c2b40]">{r.amount}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-2 text-xs rounded-md px-2 py-1 ring-1 ${badgeClass}`}>
                          {r.status === "Pending" ? <FiSend /> : r.status === "Approved" ? <FiCheckCircle /> : null}
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#0c2b40]">{r.date}</td>
                    </motion.tr>
                  );
                })}
              </motion.tbody>
            </AnimatePresence>
          </table>
        </div>
      </div>
    </motion.section>
  );
};

export default AuthorityStockRequests;