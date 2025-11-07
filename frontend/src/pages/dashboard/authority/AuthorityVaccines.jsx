import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  FiAlertTriangle,
  FiDatabase,
  FiPlus,
  FiTrash2,
  FiTrendingUp,
  FiX,
} from "react-icons/fi";

const INITIAL_VACCINES = [
  { id: "v001", name: "COVID-19 Booster", info: "Booster dose program 2025" },
  { id: "v002", name: "Hepatitis B", info: "Routine immunization for HepB" },
  { id: "v003", name: "Influenza Seasonal", info: "Seasonal flu vaccination" },
  { id: "v004", name: "Tetanus", info: "Tetanus toxoid vaccination" },
  { id: "v005", name: "BCG", info: "Bacillus Calmette–Guérin vaccine" },
];

const AuthorityVaccines = () => {
  const [vaccines, setVaccines] = useState(INITIAL_VACCINES);
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newInfo, setNewInfo] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [forecastModal, setForecastModal] = useState({ type: null, item: null });

  const nextId = () => {
    const nums = vaccines
      .map((v) => parseInt(v.id.replace(/\D/g, ""), 10))
      .filter((n) => Number.isFinite(n));
    const max = nums.length ? Math.max(...nums) : 0;
    const next = (max || 0) + 1;
    return `v${String(next).padStart(3, "0")}`;
  };

  const addVaccine = () => {
    const name = newName.trim();
    const info = newInfo.trim();
    if (!name) {
      return;
    }
    const id = nextId();
    setVaccines((prev) => [...prev, { id, name, info }]);
    setAddOpen(false);
    setNewName("");
    setNewInfo("");
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setVaccines((prev) => prev.filter((v) => v.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const openForecast = (type, item) => setForecastModal({ type, item });
  const closeForecast = () => setForecastModal({ type: null, item: null });

  const hashId = (id) => [...id].reduce((a, c) => a + c.charCodeAt(0), 0);
  const forecastText = useMemo(() => {
    if (!forecastModal.item || !forecastModal.type) return null;
    const h = hashId(forecastModal.item.id);
    if (forecastModal.type === "demand") {
      const demand = (h % 800) + 300; // 300–1100 range
      return `Projected demand over next 4 weeks: ~${demand.toLocaleString()} doses.`;
    }
    const waste = ((h % 6) + 2).toFixed(1); // 2.0–7.0%
    return `Projected wastage risk: ~${waste}% given current patterns.`;
  }, [forecastModal]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#081F2E]/15 text-[#081F2E] ring-1 ring-[#081F2E]/25">
            <FiDatabase />
          </div>
          <h2 className="text-xl font-semibold text-[#081F2E]">Vaccines</h2>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#EAB308] text-[#081F2E] px-3 py-2 text-sm hover:bg-[#d1a207]"
        >
          <FiPlus /> Add Vaccine
        </motion.button>
      </div>

      {/* Cards (CentreStock-inspired aesthetic) */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="rounded-2xl bg-white/70 backdrop-blur-md shadow-sm ring-1 ring-[#081F2E]/10 p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {vaccines.map((v, idx) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-2xl ring-1 ring-[#081F2E]/10 bg-gradient-to-br from-[#F8FAFF] via-white to-[#EFF6FF] p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#081F2E]/10 text-[#081F2E] ring-1 ring-[#081F2E]/15">
                    <FiDatabase />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#081F2E]">
                      {v.name}
                    </div>
                    <div className="text-xs text-[#0c2b40]/70 truncate max-w-[220px]">
                      {v.info || "No additional information"}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-[#0c2b40]/70 font-mono">{v.id}</div>
              </div>

              {/* Actions */}
              <div className="mt-4 grid grid-cols-3 gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openForecast("demand", v)}
                  className="inline-flex items-center justify-center gap-2 text-xs rounded-md px-3 py-2 bg-[#E9F9EE] text-[#1a8a35] ring-1 ring-[#2FC94E]/30 hover:bg-[#D7F3E2]"
                >
                  <FiTrendingUp /> Demand Forecast
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openForecast("wastage", v)}
                  className="inline-flex items-center justify-center gap-2 text-xs rounded-md px-3 py-2 bg-[#FFF7E6] text-[#A05A00] ring-1 ring-[#EAB308]/30 hover:bg-[#FDECC8]"
                >
                  <FiAlertTriangle /> Wastage Forecast
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setDeleteTarget(v)}
                  className="inline-flex items-center justify-center gap-2 text-xs rounded-md px-3 py-2 bg-[#FDECEC] text-[#F04E36] ring-1 ring-[#F04E36]/30 hover:bg-[#F9D9D4]"
                >
                  <FiTrash2 /> Delete
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Add Vaccine Modal */}
      <AnimatePresence>
        {addOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#081F2E]/40 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="w-[92%] max-w-md rounded-2xl bg-white p-5 ring-1 ring-[#081F2E]/10 shadow-xl"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAB308]/10 text-[#EAB308] ring-1 ring-[#EAB308]/20">
                    <FiPlus />
                  </div>
                  <h4 className="text-lg font-semibold text-[#081F2E]">
                    Add Vaccine
                  </h4>
                </div>
                <button
                  onClick={() => setAddOpen(false)}
                  className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-[#081F2E]/5 text-[#081F2E] hover:bg-[#081F2E]/10"
                >
                  <FiX />
                </button>
              </div>
              <div className="space-y-3 mt-2">
                <div>
                  <label className="text-xs text-[#0c2b40]/70">Vaccine Name</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g., Typhoid"
                    className="mt-1 w-full rounded-md px-3 py-2 ring-1 ring-[#081F2E]/15 bg-[#F8FAFF] focus:outline-none focus:ring-[#081F2E]/30 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#0c2b40]/70">Information</label>
                  <textarea
                    value={newInfo}
                    onChange={(e) => setNewInfo(e.target.value)}
                    placeholder="Short description or notes"
                    rows={3}
                    className="mt-1 w-full rounded-md px-3 py-2 ring-1 ring-[#081F2E]/15 bg-[#F8FAFF] focus:outline-none focus:ring-[#081F2E]/30 text-sm"
                  />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  onClick={() => setAddOpen(false)}
                  className="text-xs px-3 py-2 rounded-md bg-[#081F2E]/5 text-[#081F2E] ring-1 ring-[#081F2E]/15 hover:bg-[#081F2E]/10"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={addVaccine}
                  className="text-xs px-3 py-2 rounded-md bg-[#EAB308] text-[#081F2E] hover:bg-[#d1a207]"
                >
                  Add Vaccine
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#081F2E]/40 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="w-[92%] max-w-md rounded-2xl bg-white p-5 ring-1 ring-[#081F2E]/10 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDECEC] text-[#F04E36] ring-1 ring-[#F04E36]/30">
                  <FiTrash2 />
                </div>
                <h4 className="text-lg font-semibold text-[#081F2E]">
                  Delete Vaccine?
                </h4>
              </div>
              <p className="text-sm text-[#0c2b40]/80">
                Are you sure you want to delete
                <span className="font-semibold text-[#081F2E]"> {deleteTarget.name} </span>
                (<span className="font-mono">{deleteTarget.id}</span>)? This action cannot be undone.
              </p>
              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="text-xs px-3 py-2 rounded-md bg-[#081F2E]/5 text-[#081F2E] ring-1 ring-[#081F2E]/15 hover:bg-[#081F2E]/10"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={confirmDelete}
                  className="text-xs px-3 py-2 rounded-md bg-[#FDECEC] text-[#F04E36] ring-1 ring-[#F04E36]/30 hover:bg-[#F9D9D4]"
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Forecast Modal */}
      <AnimatePresence>
        {forecastModal.type && forecastModal.item && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#081F2E]/40 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="w-[92%] max-w-md rounded-2xl bg-white p-5 ring-1 ring-[#081F2E]/10 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-2">
                {forecastModal.type === "demand" ? (
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#E9F9EE] text-[#1a8a35] ring-1 ring-[#2FC94E]/30">
                    <FiTrendingUp />
                  </div>
                ) : (
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF7E6] text-[#A05A00] ring-1 ring-[#EAB308]/30">
                    <FiAlertTriangle />
                  </div>
                )}
                <h4 className="text-lg font-semibold text-[#081F2E]">
                  {forecastModal.type === "demand" ? "Demand Forecast" : "Wastage Forecast"}
                </h4>
              </div>
              <div className="text-sm text-[#0c2b40]/80">
                <div>
                  Vaccine: <span className="font-semibold text-[#081F2E]">{forecastModal.item.name}</span> (<span className="font-mono">{forecastModal.item.id}</span>)
                </div>
                <p className="mt-2">{forecastText}</p>
              </div>
              <div className="mt-4 flex items-center justify-end">
                <button
                  onClick={closeForecast}
                  className="text-xs px-3 py-2 rounded-md bg-[#081F2E]/5 text-[#081F2E] ring-1 ring-[#081F2E]/15 hover:bg-[#081F2E]/10"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

export default AuthorityVaccines;