import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiActivity, FiCalendar, FiRefreshCcw } from "react-icons/fi";

const SAMPLE_NAMES = [
  "Rahim Uddin",
  "Sara Noor",
  "Imran Khan",
  "Aisha Rahman",
  "Jamal Hossain",
  "Farhana Akter",
  "Nadia Islam",
  "Tanvir Ahmed",
  "Mizanur Rahman",
  "Shahida Begum",
];
const SAMPLE_VACCINES = [
  "COVID-19 Booster",
  "Hepatitis B",
  "Influenza Seasonal",
  "Tetanus",
  "BCG",
  "Typhoid",
];
const SAMPLE_STAFF_IDS = ["ST-101", "ST-102", "ST-103", "ST-104", "ST-105"];

const generateMockLogs = (count = 24) => {
  const out = [];
  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(Math.random() * 60); // within last ~60 days
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(9 + Math.floor(Math.random() * 8));
    date.setMinutes(Math.floor(Math.random() * 60));
    out.push({
      id: `l${i + 1}`,
      citizenName: SAMPLE_NAMES[i % SAMPLE_NAMES.length],
      vaccineName: SAMPLE_VACCINES[i % SAMPLE_VACCINES.length],
      staffId: SAMPLE_STAFF_IDS[i % SAMPLE_STAFF_IDS.length],
      date: date.toISOString(),
    });
  }
  return out.sort((a, b) => new Date(b.date) - new Date(a.date));
};

const LOGS = generateMockLogs(28);

const CentreLogs = () => {
  const today = new Date();
  const defaultFrom = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
  const [range, setRange] = useState({ from: defaultFrom, to: today });
  const [pending, setPending] = useState(false);

  const filteredLogs = useMemo(() => {
    const from = range.from ? new Date(range.from) : null;
    const to = range.to ? new Date(range.to) : null;
    return LOGS.filter((l) => {
      const d = new Date(l.date);
      return (!from || d >= from) && (!to || d <= to);
    });
  }, [range]);

  const setQuickRange = (days) => {
    setPending(true);
    const to = new Date();
    const from = new Date(to.getFullYear(), to.getMonth(), to.getDate() - days);
    setRange({ from, to });
    setTimeout(() => setPending(false), 450);
  };

  const onInputChange = (key, value) => {
    setRange((r) => ({ ...r, [key]: value ? new Date(value) : null }));
  };

  const applyCustom = () => {
    setPending(true);
    setTimeout(() => setPending(false), 450);
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
              <input type="date" value={range.from ? new Date(range.from).toISOString().slice(0,10) : ""} onChange={(e) => onInputChange("from", e.target.value)} className="flex-1 rounded-md bg-white ring-1 ring-[#081F2E]/15 px-3 py-2 text-xs text-[#081F2E] focus:outline-none focus:ring-2 focus:ring-[#081F2E]/30" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#0c2b40]/70">To</span>
              <input type="date" value={range.to ? new Date(range.to).toISOString().slice(0,10) : ""} onChange={(e) => onInputChange("to", e.target.value)} className="flex-1 rounded-md bg-white ring-1 ring-[#081F2E]/15 px-3 py-2 text-xs text-[#081F2E] focus:outline-none focus:ring-2 focus:ring-[#081F2E]/30" />
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
                  <th className="text-left text-xs font-semibold text-[#081F2E] px-4 py-3">Staff ID</th>
                  <th className="text-left text-xs font-semibold text-[#081F2E] px-4 py-3">Vaccination Date</th>
                </tr>
              </thead>
              <AnimatePresence>
                <motion.tbody initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="divide-y divide-[#081F2E]/10">
                  {filteredLogs.map((row, idx) => {
                    const d = new Date(row.date);
                    const formatted = d.toLocaleString("en-GB", {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    return (
                      <motion.tr key={row.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }} className="hover:bg-[#081F2E]/3">
                        <td className="px-4 py-3 text-[#081F2E] font-medium">{row.citizenName}</td>
                        <td className="px-4 py-3 text-[#0c2b40]">{row.vaccineName}</td>
                        <td className="px-4 py-3 text-[#0c2b40]">{row.staffId}</td>
                        <td className="px-4 py-3 text-[#0c2b40]">{formatted}</td>
                      </motion.tr>
                    );
                  })}
                  {filteredLogs.length === 0 && (
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