import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  FiAlertCircle,
  FiCalendar,
  FiCheckCircle,
  FiClipboard,
  FiFilter,
  FiSend,
  FiXCircle,
} from "react-icons/fi";

const STATUS = ["requested", "scheduled", "done", "cancelled", "missed"];

const STATUS_META = {
  requested: {
    label: "Requested",
    icon: FiSend,
    classes:
      "text-[#081F2E] bg-[#081F2E]/10 ring-1 ring-[#081F2E]/20",
  },
  scheduled: {
    label: "Scheduled",
    icon: FiCalendar,
    classes:
      "text-[#EAB308] bg-[#EAB308]/15 ring-1 ring-[#EAB308]/30",
  },
  done: {
    label: "Completed",
    icon: FiCheckCircle,
    classes:
      "text-[#2FC94E] bg-[#2FC94E]/10 ring-1 ring-[#2FC94E]/30",
  },
  cancelled: {
    label: "Cancelled",
    icon: FiXCircle,
    classes:
      "text-[#F04E36] bg-[#F04E36]/10 ring-1 ring-[#F04E36]/30",
  },
  missed: {
    label: "Missed",
    icon: FiAlertCircle,
    classes:
      "text-[#EAB308] bg-[#EAB308]/15 ring-1 ring-[#EAB308]/30",
  },
};

const APPOINTMENTS_MOCK = [
  {
    id: "a1",
    vaccine: "COVID-19 (Pfizer)",
    status: "requested",
    time: "2025-11-12T09:00:00.000Z",
    centre: "Agra Vaccination Centre",
  },
  {
    id: "a2",
    vaccine: "BCG",
    status: "scheduled",
    time: "2025-11-15T10:30:00.000Z",
    centre: "Agra District Clinic",
  },
  {
    id: "a3",
    vaccine: "MMR (Measles, Mumps, Rubella)",
    status: "done",
    time: "2025-10-02T14:00:00.000Z",
    centre: "Kanpur Health Centre",
  },
  {
    id: "a4",
    vaccine: "Seasonal Influenza",
    status: "cancelled",
    time: "2025-09-29T16:15:00.000Z",
    centre: "Dummy Health Centre",
  },
  {
    id: "a5",
    vaccine: "HPV",
    status: "missed",
    time: "2025-09-20T11:00:00.000Z",
    centre: "Dummy Health Centre 2",
  },
];

const formatDateTime = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const CitizenAppointments = () => {
  const [activeStatus, setActiveStatus] = useState("all");

  const data = APPOINTMENTS_MOCK;
  const filtered = useMemo(() => {
    if (activeStatus === "all") return data;
    return data.filter((a) => a.status === activeStatus);
  }, [data, activeStatus]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAB308]/20 text-[#EAB308] ring-1 ring-[#EAB308]/30">
          <FiClipboard />
        </div>
        <h2 className="text-xl font-semibold text-[#081F2E]">My Appointments</h2>
      </div>

      {/* Container */}
      <div className="rounded-2xl bg-white/70 backdrop-blur-md shadow-sm ring-1 ring-[#081F2E]/10 p-6">
        {/* Filter */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-[#0c2b40]/80">
            <FiFilter className="text-[#081F2E]/70" />
            <span>Status</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveStatus("all")}
              className={`relative inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium ring-1 ${
                activeStatus === "all"
                  ? "bg-white ring-[#F04E36]/20 text-[#081F2E] shadow"
                  : "bg-[#081F2E]/5 ring-[#081F2E]/15 text-[#081F2E]"
              }`}
            >
              All
            </motion.button>
            {STATUS.map((s) => {
              const Meta = STATUS_META[s];
              const Icon = Meta.icon;
              const isActive = activeStatus === s;
              return (
                <motion.button
                  key={s}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveStatus(s)}
                  className={`relative inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ring-1 ${
                    isActive ? "bg-white ring-[#F04E36]/20 text-[#081F2E] shadow" : "bg-[#081F2E]/5 ring-[#081F2E]/15 text-[#081F2E]"
                  }`}
                >
                  <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 ${Meta.classes}`}>
                    <Icon />
                    {Meta.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl bg-white ring-1 ring-[#081F2E]/10 overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-[#081F2E]/5">
              <tr>
                <th className="text-left text-xs font-semibold text-[#081F2E] px-4 py-3">Vaccine Name</th>
                <th className="text-left text-xs font-semibold text-[#081F2E] px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-[#081F2E] px-4 py-3">Time</th>
                <th className="text-left text-xs font-semibold text-[#081F2E] px-4 py-3">Centre</th>
              </tr>
            </thead>
            <AnimatePresence initial={false}>
              <motion.tbody
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 240, damping: 22 }}
              >
                {filtered.map((a) => {
                  const Meta = STATUS_META[a.status];
                  const Icon = Meta.icon;
                  return (
                    <motion.tr
                      key={a.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ type: "spring", stiffness: 260, damping: 24 }}
                      className="border-t border-[#081F2E]/10"
                    >
                      <td className="px-4 py-3 text-sm text-[#081F2E]">{a.vaccine}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-2 rounded-lg px-2 py-1 text-xs font-medium ${Meta.classes}`}>
                          <Icon />
                          {Meta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#0c2b40]/80">{formatDateTime(a.time)}</td>
                      <td className="px-4 py-3 text-sm text-[#0c2b40]/80">{a.centre}</td>
                    </motion.tr>
                  );
                })}
                {filtered.length === 0 && (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td colSpan={4} className="px-4 py-6 text-center text-sm text-[#0c2b40]/70">
                      No appointments found for the selected status.
                    </td>
                  </motion.tr>
                )}
              </motion.tbody>
            </AnimatePresence>
          </table>
        </div>
      </div>
    </motion.section>
  );
};

export default CitizenAppointments;