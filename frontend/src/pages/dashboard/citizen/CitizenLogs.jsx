import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FiActivity, FiCalendar } from "react-icons/fi";
import { getCurrentUser } from "../../../services/userService";
import { getCitizenLogs } from "../../../services/vaccineService";

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

// Data is fetched from API: /vaccine/log/citizen/:citizen_id

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
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        setError("");
        const user = await getCurrentUser();
        const citizenId =
          user?.citizen_id ||
          user?.id ||
          user?.data?.citizen_id ||
          user?.data?.id;
        if (!citizenId) throw new Error("Citizen identity not found");

        const res = await getCitizenLogs(citizenId);
        const list = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
          ? res.data.data
          : [];

        const normalized = list.map((item, idx) => ({
          id: item?._id || `log-${idx}`,
          vaccine: item?.vaccine_name || "Unknown",
          centre: item?.centre_id || "-",
          time: item?.date || null,
          staff: item?.staff_name || "-",
        }));

        if (!mounted) return;
        setLogs(normalized);
      } catch (e) {
        if (!mounted) return;
        setError(
          e?.response?.data?.message || e?.message || "Failed to load logs"
        );
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

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
                {loading ? (
                  <motion.tr
                    key="loader"
                    variants={rowVariants}
                    className="hover:bg-transparent"
                  >
                    <td
                      className="px-4 py-6 text-center text-[#081F2E]"
                      colSpan={4}
                    >
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="inline-flex items-center gap-2"
                      >
                        <span className="inline-block h-4 w-4 rounded-full border-2 border-[#EAB308] border-t-transparent animate-spin"></span>
                        <span>Loading logs...</span>
                      </motion.div>
                    </td>
                  </motion.tr>
                ) : error ? (
                  <motion.tr
                    key="error"
                    variants={rowVariants}
                    className="hover:bg-transparent"
                  >
                    <td className="px-4 py-4" colSpan={4}>
                      <div className="rounded-md bg-red-50 ring-1 ring-red-200 text-red-700 px-3 py-2">
                        {error}
                      </div>
                    </td>
                  </motion.tr>
                ) : logs.length === 0 ? (
                  <motion.tr
                    key="empty"
                    variants={rowVariants}
                    className="hover:bg-transparent"
                  >
                    <td
                      className="px-4 py-6 text-center text-[#0c2b40]/80"
                      colSpan={4}
                    >
                      No logs found.
                    </td>
                  </motion.tr>
                ) : (
                  logs.map((log) => (
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
                      <td className="px-4 py-3 text-[#0c2b40]/80">
                        {log.centre}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-2 text-[#081F2E]">
                          <span className="inline-flex items-center gap-1 rounded-md px-2 py-1 bg-[#081F2E]/10 text-[#081F2E] ring-1 ring-[#081F2E]/15">
                            <FiCalendar />
                            {formatDateTime(log.time)}
                          </span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#0c2b40]/80">
                        {log.staff}
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </motion.tbody>
          </table>
        </div>
      </div>
    </motion.section>
  );
};

export default CitizenLogs;
