import { AnimatePresence, motion } from "framer-motion";
import { FiActivity, FiCalendar } from "react-icons/fi";

const formatDateTime = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  const day = d.getDate();
  const suffix = (n) => {
    if (n % 10 === 1 && n % 100 !== 11) return "st";
    if (n % 10 === 2 && n % 100 !== 12) return "nd";
    if (n % 10 === 3 && n % 100 !== 13) return "rd";
    return "th";
  };
  const month = d.toLocaleString("en-GB", { month: "long" });
  const year = d.getFullYear();
  const time = d.toLocaleString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${day}${suffix(day)} ${month}, ${year} • ${time}`;
};

const LOGS = [
  {
    id: "l1",
    vaccine: "BCG",
    centre: "Agra Vaccination Centre",
    time: "2025-11-10T09:30:00.000Z",
    staff: "Dr. A Sharma",
  },
  {
    id: "l2",
    vaccine: "COVID-19 (Pfizer)",
    centre: "Agra District Clinic",
    time: "2025-11-12T14:00:00.000Z",
    staff: "Nurse R Gupta",
  },
  {
    id: "l3",
    vaccine: "MMR (Measles, Mumps, Rubella)",
    centre: "Kanpur Health Centre",
    time: "2025-11-15T10:15:00.000Z",
    staff: "Dr. S Mehta",
  },
  {
    id: "l4",
    vaccine: "Seasonal Influenza",
    centre: "Dummy Health Centre",
    time: "2025-11-15T16:45:00.000Z",
    staff: "Nurse P Kumar",
  },
  {
    id: "l5",
    vaccine: "HPV",
    centre: "Dummy Health Centre 3",
    time: "2025-11-25T11:00:00.000Z",
    staff: "Dr. N Rao",
  },
  {
    id: "l6",
    vaccine: "BCG",
    centre: "Dummy Health Centre 2",
    time: "2025-12-01T08:30:00.000Z",
    staff: "Nurse T Mishra",
  },
];

const tableVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, ease: "easeOut" },
  },
};

const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

const CitizenLogs = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAB308]/20 text-[#EAB308] ring-1 ring-[#EAB308]/30">
          <FiActivity />
        </div>
        <h2 className="text-xl font-semibold text-[#081F2E]">Logs</h2>
      </div>

      <div className="rounded-2xl bg-white/70 backdrop-blur-md shadow-sm ring-1 ring-[#081F2E]/10 p-6">
        <div className="mb-4 text-sm text-[#0c2b40]/70">
          Review vaccination activity across centres, times, and staff.
        </div>
        <div className="rounded-xl bg-white ring-1 ring-[#081F2E]/10 overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-[#081F2E]/5">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#081F2E]/80">
                  Vaccine Name
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#081F2E]/80">
                  Centre Name
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#081F2E]/80">
                  Vaccination Time
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#081F2E]/80">
                  Staff Name
                </th>
              </tr>
            </thead>
            <motion.tbody
              variants={tableVariants}
              initial="hidden"
              animate="show"
              className="divide-y divide-[#081F2E]/10"
            >
              <AnimatePresence>
                {LOGS.map((log) => (
                  <motion.tr
                    key={log.id}
                    variants={rowVariants}
                    className="hover:bg-[#081F2E]/3"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#EAB308]/20 text-[#EAB308] ring-1 ring-[#EAB308]/30">
                          <FiActivity />
                        </div>
                        <span className="font-medium text-[#081F2E]">
                          {log.vaccine}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#0c2b40]/80">{log.centre}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2 text-[#081F2E]">
                        <span className="inline-flex items-center gap-1 rounded-md px-2 py-1 bg-[#081F2E]/10 text-[#081F2E] ring-1 ring-[#081F2E]/15">
                          <FiCalendar />
                          {formatDateTime(log.time)}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#0c2b40]/80">{log.staff}</td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </motion.tbody>
          </table>
        </div>
      </div>
    </motion.section>
  );
};

export default CitizenLogs;