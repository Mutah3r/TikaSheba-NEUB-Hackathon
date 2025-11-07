import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiActivity, FiCalendar, FiRefreshCcw } from "react-icons/fi";
import { getCentreLogs } from "../../../services/graphService";

const CentreLogs = () => {
  const today = new Date();
  const [range, setRange] = useState({ from: null, to: null });
  const [pending, setPending] = useState(false);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);

  // Format a JS Date to ISO string at local day start/end (for backend parsing)
  const toISOStartOfDay = (d) => {
    const start = new Date(d);
    start.setHours(0, 0, 0, 0);
    return start.toISOString();
  };
  const toISOEndOfDay = (d) => {
    const end = new Date(d);
    end.setHours(23, 59, 59, 999);
    return end.toISOString();
  };
  // For input fields, still show local YYYY-MM-DD for convenience
  const formatInputDate = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const fetchLogs = async (from, to) => {
    try {
      setPending(true);
      setError(null);
      let resp;
      if (from && to) {
        const params = {
          start: toISOStartOfDay(from),
          end: toISOEndOfDay(to),
        };
        resp = await getCentreLogs(params);
      } else {
        // No filters: fetch all logs (backend will return all without date filter)
        resp = await getCentreLogs();
      }
      const data = resp?.logs || [];
      console.log(data);
      setLogs(data);
    } catch (e) {
      setError(e?.data?.message || e?.message || "Failed to load logs");
    } finally {
      setPending(false);
    }
  };

  useEffect(() => {
    // Initial load: show all logs (no date filter)
    fetchLogs(null, null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setQuickRange = (days) => {
    setPending(true);
    const to = new Date();
    const from = new Date(to.getFullYear(), to.getMonth(), to.getDate() - days);
    setRange({ from, to });
    fetchLogs(from, to);
  };

  const onInputChange = (key, value) => {
    setRange((r) => ({ ...r, [key]: value ? new Date(`${value}T00:00:00`) : null }));
  };

  const applyCustom = () => {
    if (range.from && range.to) {
      fetchLogs(range.from, range.to);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#081F2E]/15 text-[#081F2E] ring-1 ring-[#081F2E]/25">
          <FiActivity />
        </div>
        <h2 className="text-xl font-semibold text-[#081F2E]">Centre Logs</h2>
      </div>

      <div className="rounded-2xl bg-white/70 backdrop-blur-md shadow-sm ring-1 ring-[#081F2E]/10 p-6 space-y-4">
        {/* Date Range Picker */}
        <div className="rounded-2xl p-4 ring-1 ring-[#081F2E]/10 bg-gradient-to-br from-[#F8FAFF] via-white to-[#EFF6FF]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-[#0c2b40]/80">
              <FiCalendar />
              <span>Filter by date range</span>
            </div>
            <div className="flex gap-2">
              <motion.button whileTap={{ scale: 0.98 }} onClick={() => setQuickRange(7)} className="text-xs px-3 py-1.5 rounded-md bg-[#081F2E]/10 text-[#081F2E] ring-1 ring-[#081F2E]/20 hover:bg-[#081F2E]/15">Last 7 days</motion.button>
              <motion.button whileTap={{ scale: 0.98 }} onClick={() => setQuickRange(30)} className="text-xs px-3 py-1.5 rounded-md bg-[#081F2E]/10 text-[#081F2E] ring-1 ring-[#081F2E]/20 hover:bg-[#081F2E]/15">Last 30 days</motion.button>
              <motion.button whileTap={{ scale: 0.98 }} onClick={() => setQuickRange(90)} className="text-xs px-3 py-1.5 rounded-md bg-[#081F2E]/10 text-[#081F2E] ring-1 ring-[#081F2E]/20 hover:bg-[#081F2E]/15">Last 90 days</motion.button>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#0c2b40]/70">From</span>
              <input type="date" value={range.from ? formatInputDate(range.from) : ""} onChange={(e) => onInputChange("from", e.target.value)} className="flex-1 rounded-md bg-white ring-1 ring-[#081F2E]/15 px-3 py-2 text-xs text-[#081F2E] focus:outline-none focus:ring-2 focus:ring-[#081F2E]/30" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#0c2b40]/70">To</span>
              <input type="date" value={range.to ? formatInputDate(range.to) : ""} onChange={(e) => onInputChange("to", e.target.value)} className="flex-1 rounded-md bg-white ring-1 ring-[#081F2E]/15 px-3 py-2 text-xs text-[#081F2E] focus:outline-none focus:ring-2 focus:ring-[#081F2E]/30" />
            </div>
            <div className="flex items-center justify-end">
              <motion.button whileTap={{ scale: 0.98 }} onClick={applyCustom} className="text-xs px-3 py-2 rounded-md bg-[#E9F9EE] text-[#1a8a35] ring-1 ring-[#2FC94E]/30 hover:bg-[#D7F3E2]">Apply</motion.button>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="relative rounded-xl bg-white ring-1 ring-[#081F2E]/10 overflow-hidden">
          {pending && (
            <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-sm flex items-center justify-center">
              <div className="inline-flex items-center gap-2 text-[#081F2E] text-sm">
                <FiRefreshCcw className="animate-spin" />
                <span>Updating logs…</span>
              </div>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-[#081F2E]/5">
                <tr>
                  <th className="text-left text-xs font-semibold text-[#081F2E] px-4 py-3">Citizen Name</th>
                  <th className="text-left text-xs font-semibold text-[#081F2E] px-4 py-3">Vaccine Name</th>
                  <th className="text-left text-xs font-semibold text-[#081F2E] px-4 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-[#081F2E] px-4 py-3">Vaccination Date</th>
                </tr>
              </thead>
              <AnimatePresence>
                <motion.tbody initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="divide-y divide-[#081F2E]/10">
                  {logs.map((row, idx) => {
                    const d = new Date(row.date);
                    const formatted = d.toLocaleString("en-GB", {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    return (
                      <motion.tr key={`${row.citizen_id}-${row.date}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }} className="hover:bg-[#081F2E]/3">
                        <td className="px-4 py-3 text-[#081F2E] font-medium">{row.citizen_name || "Unknown"}</td>
                        <td className="px-4 py-3 text-[#0c2b40]">{row.vaccine_name}</td>
                        <td className="px-4 py-3 text-[#0c2b40]">{row.status}</td>
                        <td className="px-4 py-3 text-[#0c2b40]">{formatted}</td>
                      </motion.tr>
                    );
                  })}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-sm text-[#0c2b40]/70">No logs for the selected date range</td>
                    </tr>
                  )}
                </motion.tbody>
              </AnimatePresence>
            </table>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default CentreLogs;