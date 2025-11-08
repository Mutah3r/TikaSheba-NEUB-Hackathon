import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  FiAlertTriangle,
  FiBarChart,
  FiClock,
  FiRefreshCw,
  FiTrendingUp,
  FiX,
} from "react-icons/fi";
import { getWasteForecast, getDemandForecast } from "../../../services/aiService";
import { listAssignedCentreVaccines } from "../../../services/centreVaccineService";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from "recharts";
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
  const [rows, setRows] = useState(VACCINES);
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
    error: null,
  });

  useEffect(() => {
    const loadAssigned = async () => {
      try {
        const data = await listAssignedCentreVaccines();
        const normalized = Array.isArray(data)
          ? data.map((v) => ({
              vaccineId: v?.vaccine_id || v?.vaccineId || v?.id,
              vaccineName:
                v?.vaccine_name || v?.vaccineName || v?.name || "Vaccine",
              vaccine_id: v?.vaccine_id || v?.id,
              centre_vaccine_id: v?.centre_vaccine_id || v?._id || v?.id,
            }))
          : [];
        if (normalized.length) setRows(normalized);
      } catch (_) {
        // keep static list
      }
    };
    loadAssigned();
  }, []);

  const openDemand = (item) =>
    setDemandModal({
      open: true,
      item,
      loading: false,
      period: null,
      result: null,
      error: null,
    });
  const closeDemand = () =>
    setDemandModal({
      open: false,
      item: null,
      loading: false,
      period: null,
      result: null,
      error: null,
    });
  const selectDemandPeriod = async (p) => {
    const days_to_forecast = Math.max(1, (p?.weeks || 0) * 7);
    const centre_vaccine_id =
      demandModal.item?.vaccine_id ||
      demandModal.item?.id ||
      demandModal.item?.vaccineId;
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    const auth_token = token ? `Bearer ${token}` : "";
    setDemandModal((m) => ({
      ...m,
      loading: true,
      period: p,
      result: null,
      error: null,
    }));
    try {
      const res = await getDemandForecast({
        centre_vaccine_id,
        days_to_forecast,
        auth_token,
      });
      setDemandModal((m) => ({ ...m, loading: false, result: res }));
    } catch (err) {
      setDemandModal((m) => ({
        ...m,
        loading: false,
        error:
          err?.response?.data?.message ||
          err?.message ||
          "Failed to fetch demand forecast",
      }));
    }
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
    const days_to_forecast = Math.max(1, (p?.weeks || 0) * 7);
    const centre_vaccine_id =
      wasteModal.item?.vaccine_id ||
      wasteModal.item?.id ||
      wasteModal.item?.vaccineId;
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    const auth_token = token ? `Bearer ${token}` : "";
    setWasteModal((m) => ({
      ...m,
      loading: true,
      period: p,
      result: null,
      error: null,
    }));
    (async () => {
      try {
        const body = { centre_vaccine_id, days_to_forecast, auth_token };
        console.log(body);
        const res = await getWasteForecast(body);
        setWasteModal((m) => ({
          ...m,
          loading: false,
          result: res,
          error: null,
        }));
      } catch (err) {
        setWasteModal((m) => ({
          ...m,
          loading: false,
          error: err?.message || "Could not fetch wastage forecast.",
        }));
      }
    })();
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
          {rows.map((row, idx) => (
            <motion.div
              key={row.vaccine_id || row.vaccineId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              className="rounded-2xl p-5 shadow-sm ring-1 bg-gradient-to-br from-[#FFF5E6] via-white to-[#FFF5E6] ring-[#081F2E]/10"
            >
              <div className="flex items-center justify-between">
                <div className="text-xs text-[#0c2b40]/70 font-mono">
                  {row.vaccine_id || row.vaccineId}
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
                <span className="font-mono">
                  {demandModal.item?.vaccine_id || demandModal.item?.vaccineId}
                </span>
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

              <div className="mt-4 min-h-[120px]">
                {demandModal.loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 24 }}
                    className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-xs text-[#081F2E] ring-1 ring-[#081F2E]/10"
                  >
                    <FiRefreshCw className="animate-spin" /> Fetching
                    forecast...
                  </motion.div>
                )}
                {!demandModal.loading && demandModal.error && (
                  <div className="inline-flex items-center gap-2 rounded-md bg-[#F04E36]/10 text-[#9b2c1a] ring-1 ring-[#F04E36]/30 px-3 py-2 text-xs">
                    <FiAlertTriangle />
                    {demandModal.error}
                  </div>
                )}
                {!demandModal.loading && demandModal.result?.daily_forecast && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="inline-flex items-center gap-1 rounded-md bg-[#E9F9EE] text-[#1a8a35] ring-1 ring-[#2FC94E]/30 px-2 py-1">
                        <FiTrendingUp /> Total forecast: {demandModal.result?.forecast_total}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-md bg-[#E9F9EE] text-[#1a8a35] ring-1 ring-[#2FC94E]/30 px-2 py-1">
                        Days: {demandModal.result?.days_forecasted}
                      </span>
                    </div>
                    <div className="rounded-xl bg-[#081F2E]/5 ring-1 ring-[#081F2E]/10 p-3">
                      {(() => {
                        const raw = demandModal.result.daily_forecast || [];
                        const data = raw.map((d) => ({
                          date: d.date,
                          predicted: d.predicted_usage || 0,
                          margin: Math.max(0, (d.upper_bound || 0) - (d.predicted_usage || 0)),
                          lower: d.lower_bound || 0,
                          upper: d.upper_bound || 0,
                        }));
                        return (
                          <div className="h-[220px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, bottom: 8, left: 16 }}>
                                <CartesianGrid stroke="#081F2E1A" horizontal vertical={false} />
                                <XAxis type="number" tick={{ fill: "#0c2b40", fontSize: 11 }} axisLine={{ stroke: "#081F2E2B" }} tickLine={{ stroke: "#081F2E2B" }} />
                                <YAxis dataKey="date" type="category" tick={{ fill: "#0c2b40", fontSize: 11 }} axisLine={{ stroke: "#081F2E2B" }} tickLine={{ stroke: "#081F2E2B" }} width={88} />
                                <Tooltip cursor={{ fill: "#081F2E0A" }} contentStyle={{ borderRadius: 12, background: "#fff", border: "1px solid rgba(8,31,46,0.1)" }} />
                                <Bar dataKey="predicted" stackId="forecast" fill="#2FC94E" radius={[4, 4, 4, 4]} name="Predicted Usage" />
                                <Bar dataKey="margin" stackId="forecast" fill="#EAB30866" radius={[4, 4, 4, 4]} name="Upper Bound Margin" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        );
                      })()}
                    </div>
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
                (
                <span className="font-mono">
                  {wasteModal.item?.vaccine_id || wasteModal.item?.vaccineId}
                </span>
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

              <div className="mt-4 min-h-[120px]">
                {wasteModal.loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 24 }}
                    className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-xs text-[#081F2E] ring-1 ring-[#081F2E]/10"
                  >
                    <FiRefreshCw className="animate-spin" /> Fetching
                    forecast...
                  </motion.div>
                )}
                {!wasteModal.loading && wasteModal.error && (
                  <div className="inline-flex items-center gap-2 rounded-md bg-[#F04E36]/10 text-[#9b2c1a] ring-1 ring-[#F04E36]/30 px-3 py-2 text-xs">
                    <FiAlertTriangle />
                    {wasteModal.error}
                  </div>
                )}
                {!wasteModal.loading && wasteModal.result?.daily_forecast && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="inline-flex items-center gap-1 rounded-md bg-[#FFE8BF] text-[#A05A00] ring-1 ring-[#EAB308]/30 px-2 py-1">
                        <FiAlertTriangle /> Total forecast:{" "}
                        {wasteModal.result?.forecast_total}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-md bg-[#E9F9EE] text-[#1a8a35] ring-1 ring-[#2FC94E]/30 px-2 py-1">
                        Days: {wasteModal.result?.days_forecasted}
                      </span>
                    </div>
                    <div className="rounded-xl bg-[#081F2E]/5 ring-1 ring-[#081F2E]/10 p-3">
                      {(() => {
                        const raw = wasteModal.result.daily_forecast || [];
                        const data = raw.map((d) => ({
                          date: d.date,
                          predicted: d.predicted_usage || 0,
                          margin: Math.max(0, (d.upper_bound || 0) - (d.predicted_usage || 0)),
                          lower: d.lower_bound || 0,
                          upper: d.upper_bound || 0,
                        }));
                        return (
                          <div className="h-[220px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, bottom: 8, left: 16 }}>
                                <CartesianGrid stroke="#081F2E1A" horizontal vertical={false} />
                                <XAxis type="number" tick={{ fill: "#0c2b40", fontSize: 11 }} axisLine={{ stroke: "#081F2E2B" }} tickLine={{ stroke: "#081F2E2B" }} />
                                <YAxis dataKey="date" type="category" tick={{ fill: "#0c2b40", fontSize: 11 }} axisLine={{ stroke: "#081F2E2B" }} tickLine={{ stroke: "#081F2E2B" }} width={88} />
                                <Tooltip cursor={{ fill: "#081F2E0A" }} contentStyle={{ borderRadius: 12, background: "#fff", border: "1px solid rgba(8,31,46,0.1)" }} />
                                <Bar dataKey="predicted" stackId="forecast" fill="#2FC94E" radius={[4, 4, 4, 4]} name="Predicted Usage" />
                                <Bar dataKey="margin" stackId="forecast" fill="#EAB30866" radius={[4, 4, 4, 4]} name="Upper Bound Margin" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        );
                      })()}
                    </div>
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
