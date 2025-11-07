import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import {
  FiAlertTriangle,
  FiBarChart,
  FiClock,
  FiRefreshCw,
  FiTrendingUp,
  FiX,
} from "react-icons/fi";

const VACCINES = [
  { vaccineId: "covid_booster", vaccineName: "COVID-19 Booster" },
  { vaccineId: "influenza", vaccineName: "Influenza Seasonal" },
  { vaccineId: "hep_b", vaccineName: "Hepatitis B" },
  { vaccineId: "tetanus", vaccineName: "Tetanus" },
  { vaccineId: "bcg", vaccineName: "BCG" },
];

const PERIODS = [
  { key: "1w", label: "1 Week", weeks: 1 },
  { key: "2w", label: "2 Weeks", weeks: 2 },
  { key: "3w", label: "3 Weeks", weeks: 3 },
  { key: "1m", label: "1 Month", weeks: 4 },
  { key: "2m", label: "2 Months", weeks: 8 },
  { key: "4m", label: "4 Months", weeks: 16 },
  { key: "6m", label: "6 Months", weeks: 24 },
];

const hashId = (id) => [...id].reduce((a, c) => a + c.charCodeAt(0), 0);
const computeDemand = (id, weeks) => {
  const h = hashId(id);
  const base = 30 + (h % 35); // 30–64 base per week
  const factor = 1 + (h % 7) / 50; // +0–14%
  return Math.round(base * weeks * factor);
};
const computeWastage = (id, weeks) => {
  const demand = computeDemand(id, weeks);
  const h = hashId(id);
  const wasteRate = 0.05 + (h % 6) / 100; // 5%–10%
  return Math.round(demand * wasteRate);
};

const CentreForecast = () => {
  const [demandModal, setDemandModal] = useState({
    open: false,
    item: null,
    loading: false,
    period: null,
    result: null,
  });
  const [wasteModal, setWasteModal] = useState({
    open: false,
    item: null,
    loading: false,
    period: null,
    result: null,
  });

  const openDemand = (item) =>
    setDemandModal({
      open: true,
      item,
      loading: false,
      period: null,
      result: null,
    });
  const closeDemand = () =>
    setDemandModal({
      open: false,
      item: null,
      loading: false,
      period: null,
      result: null,
    });
  const selectDemandPeriod = (p) => {
    setDemandModal((m) => ({ ...m, loading: true, period: p, result: null }));
    setTimeout(() => {
      const val = computeDemand(demandModal.item?.vaccineId, p.weeks);
      setDemandModal((m) => ({ ...m, loading: false, result: val }));
    }, 1400);
  };

  const openWaste = (item) =>
    setWasteModal({
      open: true,
      item,
      loading: false,
      period: null,
      result: null,
    });
  const closeWaste = () =>
    setWasteModal({
      open: false,
      item: null,
      loading: false,
      period: null,
      result: null,
    });
  const selectWastePeriod = (p) => {
    setWasteModal((m) => ({ ...m, loading: true, period: p, result: null }));
    setTimeout(() => {
      const val = computeWastage(wasteModal.item?.vaccineId, p.weeks);
      setWasteModal((m) => ({ ...m, loading: false, result: val }));
    }, 1400);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="space-y-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="rounded-2xl bg-white/70 backdrop-blur-md shadow-sm ring-1 ring-[#081F2E]/10 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#081F2E]/10 text-[#081F2E] ring-1 ring-[#081F2E]/20">
              <FiBarChart />
            </div>
            <h3 className="text-lg font-semibold text-[#081F2E]">
              Vaccine Forecasts
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {VACCINES.map((row, idx) => (
            <motion.div
              key={row.vaccineId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              className="rounded-2xl p-5 shadow-sm ring-1 bg-gradient-to-br from-[#FFF5E6] via-white to-[#FFF5E6] ring-[#081F2E]/10"
            >
              <div className="flex items-center justify-between">
                <div className="text-xs text-[#0c2b40]/70 font-mono">
                  {row.vaccineId}
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#0c2b40]/80">Vaccine Name</span>
                  <span className="text-[#081F2E] font-semibold">
                    {row.vaccineName}
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-3 justify-centre items-center">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openDemand(row)}
                    className="justify-center inline-flex items-center gap-2 text-xs rounded-md px-3 py-1.5 bg-[#E9F9EE] text-[#1a8a35] ring-1 ring-[#2FC94E]/30 hover:bg-[#D7F3E2]"
                  >
                    <FiTrendingUp />
                    Demand Forecast
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openWaste(row)}
                    className="justify-center inline-flex items-center gap-2 text-xs rounded-md px-3 py-1.5 bg-[#FFF5E6] text-[#A05A00] ring-1 ring-[#EAB308]/30 hover:bg-[#FFE8BF]"
                  >
                    <FiAlertTriangle />
                    Wastage Forecast
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Demand Forecast Modal */}
      <AnimatePresence>
        {demandModal.open && (
          <motion.div
            key="demand-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#081F2E]/40 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              key="demand-modal"
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="w-[92%] max-w-md rounded-2xl bg-white p-5 ring-1 ring-[#081F2E]/10 shadow-xl"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#E9F9EE] text-[#1a8a35] ring-1 ring-[#2FC94E]/30">
                    <FiTrendingUp />
                  </div>
                  <h4 className="text-lg font-semibold text-[#081F2E]">
                    Demand Forecast
                  </h4>
                </div>
                <button
                  onClick={closeDemand}
                  className="text-[#081F2E]/60 hover:text-[#081F2E]"
                >
                  <FiX />
                </button>
              </div>
              <p className="text-sm text-[#0c2b40]/80">
                Select a period for
                <span className="font-semibold text-[#081F2E]">
                  {" "}
                  {demandModal.item?.vaccineName}
                </span>{" "}
                (
                <span className="font-mono">{demandModal.item?.vaccineId}</span>
                ).
              </p>

              <div className="mt-3 grid grid-cols-3 gap-2">
                {PERIODS.map((p) => (
                  <motion.button
                    key={p.key}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => selectDemandPeriod(p)}
                    className="flex items-center justify-center gap-1.5 text-xs rounded-md px-3 py-1.5 ring-1 ring-[#081F2E]/15 bg-white hover:bg-[#f7f9fb] text-[#081F2E]"
                  >
                    <FiClock /> {p.label}
                  </motion.button>
                ))}
              </div>

              <div className="mt-4 min-h-[56px]">
                {demandModal.loading && (
                  <div className="inline-flex items-center gap-2 text-xs text-[#081F2E]">
                    <FiRefreshCw className="animate-spin" /> Calculating
                    forecast...
                  </div>
                )}
                {!demandModal.loading && demandModal.result !== null && (
                  <div className="inline-flex items-center gap-2 rounded-md bg-[#E9F9EE] text-[#1a8a35] ring-1 ring-[#2FC94E]/30 px-3 py-2 text-xs">
                    <FiTrendingUp />
                    <span className="font-semibold">Demand:</span>
                    <span>{demandModal.result.toLocaleString()} ampules</span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={closeDemand}
                  className="px-3 py-1.5 text-xs rounded-md ring-1 ring-[#081F2E]/20 text-[#081F2E] bg-white hover:bg-[#f7f9fb]"
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wastage Forecast Modal */}
      <AnimatePresence>
        {wasteModal.open && (
          <motion.div
            key="waste-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#081F2E]/40 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              key="waste-modal"
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="w-[92%] max-w-md rounded-2xl bg-white p-5 ring-1 ring-[#081F2E]/10 shadow-xl"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF5E6] text-[#A05A00] ring-1 ring-[#EAB308]/30">
                    <FiAlertTriangle />
                  </div>
                  <h4 className="text-lg font-semibold text-[#081F2E]">
                    Wastage Forecast
                  </h4>
                </div>
                <button
                  onClick={closeWaste}
                  className="text-[#081F2E]/60 hover:text-[#081F2E]"
                >
                  <FiX />
                </button>
              </div>
              <p className="text-sm text-[#0c2b40]/80">
                Select a period for
                <span className="font-semibold text-[#081F2E]">
                  {" "}
                  {wasteModal.item?.vaccineName}
                </span>{" "}
                (<span className="font-mono">{wasteModal.item?.vaccineId}</span>
                ).
              </p>

              <div className="mt-3 grid grid-cols-3 gap-2">
                {PERIODS.map((p) => (
                  <motion.button
                    key={p.key}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => selectWastePeriod(p)}
                    className="flex items-center justify-center gap-1.5 text-xs rounded-md px-3 py-1.5 ring-1 ring-[#081F2E]/15 bg-white hover:bg-[#f7f9fb] text-[#081F2E]"
                  >
                    <FiClock /> {p.label}
                  </motion.button>
                ))}
              </div>

              <div className="mt-4 min-h-[56px]">
                {wasteModal.loading && (
                  <div className="inline-flex items-center gap-2 text-xs text-[#081F2E]">
                    <FiRefreshCw className="animate-spin" /> Calculating
                    forecast...
                  </div>
                )}
                {!wasteModal.loading && wasteModal.result !== null && (
                  <div className="inline-flex items-center gap-2 rounded-md bg-[#FFE8BF] text-[#A05A00] ring-1 ring-[#EAB308]/30 px-3 py-2 text-xs">
                    <FiAlertTriangle />
                    <span className="font-semibold">Wastage:</span>
                    <span>{wasteModal.result.toLocaleString()} ampules</span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={closeWaste}
                  className="px-3 py-1.5 text-xs rounded-md ring-1 ring-[#081F2E]/20 text-[#081F2E] bg-white hover:bg-[#f7f9fb]"
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

export default CentreForecast;
