import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
} from "recharts";
import { FiUsers, FiTrendingUp, FiClipboard, FiMapPin, FiHash, FiInfo, FiDroplet, FiTrash2 } from "react-icons/fi";
import { useMemo, useState } from "react";

const CentreDashboard = () => {
  const centre = useMemo(
    () => ({
      name: "Dhaka Central Vaccination Centre",
      location: "Dhaka, Bangladesh",
      id: "CTR-00123",
      totalStaff: 28,
    }),
    []
  );

  const vaccines = useMemo(
    () => [
      {
        id: "covid_booster",
        name: "COVID-19 Booster",
        desc: "mRNA-based booster to extend COVID-19 protection.",
        img: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=60",
        weeklyCount: 112,
      },
      {
        id: "hep_b",
        name: "Hepatitis B",
        desc: "Prevents Hepatitis B; recommended series at varied ages.",
        img: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=60",
        weeklyCount: 76,
      },
      {
        id: "influenza",
        name: "Influenza Seasonal",
        desc: "Annual flu shot tailored to current strains.",
        img: "https://images.unsplash.com/photo-1550831107-1553da8c8464?w=800&auto=format&fit=crop&q=60",
        weeklyCount: 54,
      },
      {
        id: "tetanus",
        name: "Tetanus",
        desc: "Protects against tetanus; often given as part of Td.",
        img: "https://images.unsplash.com/photo-1582545144319-0d3f85fddc8b?w=800&auto=format&fit=crop&q=60",
        weeklyCount: 31,
      },
      {
        id: "bcg",
        name: "BCG",
        desc: "Protects newborns against severe forms of tuberculosis.",
        img: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=60",
        weeklyCount: 22,
      },
    ],
    []
  );

  const [selected, setSelected] = useState(null);

  const maxWeekly = Math.max(...vaccines.map((v) => v.weeklyCount));
  const chartData = useMemo(() => vaccines.map((v) => ({ name: v.name, weeklyCount: v.weeklyCount })), [vaccines]);
  const totalServed = vaccines.reduce((acc, v) => acc + v.weeklyCount, 0);
  const totalDosage = totalServed; // placeholder: doses administered last week
  const weeklyWaste = Math.round(totalServed * 0.04); // placeholder estimate (4%)
  const dailyServed = Math.round(totalServed / 7);

  return (
    <div className="space-y-6">
      {/* Top metrics */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 22 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {/* Total People Served (Last Week) */}
        <div className="rounded-2xl bg-white shadow ring-1 ring-[#081F2E]/10 p-5">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#081F2E]/10 text-[#081F2E] mb-3">
            <FiUsers />
          </div>
          <p className="text-sm text-[#0c2b40]/70">Total People Served (Last Week)</p>
          <p className="text-lg font-semibold">{totalServed}</p>
        </div>
        {/* Vaccine Dosages (Last Week) */}
        <div className="rounded-2xl bg-white shadow ring-1 ring-[#EAB308]/20 p-5">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAB308]/10 text-[#EAB308] mb-3">
            <FiDroplet />
          </div>
          <p className="text-sm text-[#0c2b40]/70">Vaccine Dosages (Last Week)</p>
          <p className="text-lg font-semibold">{totalDosage}</p>
        </div>
        {/* Wasted Vaccines (Last Week) */}
        <div className="rounded-2xl bg-white shadow ring-1 ring-[#F04E36]/10 p-5">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#F04E36]/10 text-[#F04E36] mb-3">
            <FiTrash2 />
          </div>
          <p className="text-sm text-[#0c2b40]/70">Wasted Vaccines (Last Week)</p>
          <p className="text-lg font-semibold">{weeklyWaste}</p>
        </div>
      </motion.div>

      {/* Main content + Floating action bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 240, damping: 22 }}
          className="lg:col-span-8 space-y-6"
        >
          {/* Offered Vaccines */}
          <div className="rounded-2xl bg-white/70 backdrop-blur-md shadow-sm ring-1 ring-[#081F2E]/10 overflow-hidden">
            <div className="p-5 border-b border-[#081F2E]/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAB308]/15 text-[#EAB308] ring-1 ring-[#EAB308]/30">
                  <FiInfo />
                </div>
                <h2 className="text-xl font-semibold text-[#081F2E]">Offered Vaccines</h2>
              </div>
            </div>
            <div className="p-5">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-[#FFF5E6] via-[#fff] to-[#FFEFEA]">
                      <th className="text-left px-4 py-3 text-sm font-semibold text-[#0c2b40]">Vaccine Name</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-[#0c2b40]">Action</th>
                    </tr>
                  </thead>
                  <AnimatePresence>
                    <motion.tbody initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      {vaccines.map((v, idx) => (
                        <motion.tr
                          key={v.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="border-t border-[#081F2E]/10 hover:bg-[#081F2E]/3"
                        >
                          <td className="px-4 py-3 text-[#081F2E] font-medium">{v.name}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => setSelected(v)}
                              className="inline-flex items-center gap-2 rounded-xl bg-[#081F2E] text-white px-3 py-2 text-sm hover:bg-[#0c2b40]"
                            >
                              Details
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </motion.tbody>
                  </AnimatePresence>
                </table>
              </div>
            </div>
          </div>

          {/* Weekly Serve Bar Chart (Recharts) */}
          <div className="rounded-2xl bg-white/70 backdrop-blur-md shadow-sm ring-1 ring-[#081F2E]/10 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-[#081F2E]">Weekly Serve Count</h3>
              <span className="text-xs text-[#0c2b40]/70">Last 7 days</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 12, right: 12, left: 12, bottom: 12 }}>
                  <CartesianGrid stroke="#081F2E" strokeOpacity={0.1} vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "#081F2E", fontSize: 12 }} axisLine={{ stroke: "#081F2E", strokeOpacity: 0.2 }} tickLine={{ stroke: "#081F2E", strokeOpacity: 0.2 }} />
                  <YAxis tick={{ fill: "#081F2E", fontSize: 12 }} axisLine={{ stroke: "#081F2E", strokeOpacity: 0.2 }} tickLine={{ stroke: "#081F2E", strokeOpacity: 0.2 }} />
                  <Tooltip cursor={{ fill: "#081F2E", fillOpacity: 0.04 }} contentStyle={{ backgroundColor: "#fff", border: "1px solid rgba(8,31,46,0.15)", borderRadius: 12 }} labelStyle={{ color: "#081F2E" }} itemStyle={{ color: "#081F2E" }} />
                  <Bar dataKey="weeklyCount" fill="#2FC94E" stroke="#2FC94E" isAnimationActive animationDuration={700}>
                    <LabelList dataKey="weeklyCount" position="top" style={{ fill: "#081F2E", fontSize: 11 }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.section>

        {/* Floating Action Bar */}
        <motion.aside
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 240, damping: 22 }}
          className="lg:col-span-4"
        >
          <div className="lg:sticky lg:top-20">
            <div className="rounded-2xl bg-white/80 backdrop-blur-md shadow-sm ring-1 ring-[#081F2E]/10 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#081F2E]/10 text-[#081F2E] ring-1 ring-[#081F2E]/20">
                  <FiInfo />
                </div>
                <h3 className="text-lg font-semibold text-[#081F2E]">Centre Details</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <FiUsers className="text-[#081F2E]/70" />
                  <span className="text-[#0c2b40]/80">Name:</span>
                  <span className="font-semibold text-[#081F2E]">{centre.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiMapPin className="text-[#081F2E]/70" />
                  <span className="text-[#0c2b40]/80">Location:</span>
                  <span className="font-semibold text-[#081F2E]">{centre.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiHash className="text-[#081F2E]/70" />
                  <span className="text-[#0c2b40]/80">ID:</span>
                  <span className="font-semibold text-[#081F2E]">{centre.id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiUsers className="text-[#081F2E]/70" />
                  <span className="text-[#0c2b40]/80">Total Staff:</span>
                  <span className="font-semibold text-[#081F2E]">{centre.totalStaff}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiTrendingUp className="text-[#081F2E]/70" />
                  <span className="text-[#0c2b40]/80">Daily People Served:</span>
                  <span className="font-semibold text-[#081F2E]">{dailyServed}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.aside>
      </div>

      {/* Vaccine Details Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-lg rounded-2xl bg-white ring-1 ring-[#081F2E]/10 shadow-xl"
            >
              <div className="overflow-hidden rounded-t-2xl">
                <img src={selected.img} alt={selected.name} className="h-40 w-full object-cover" />
              </div>
              <div className="p-5 space-y-3">
                <h4 className="text-lg font-semibold text-[#081F2E]">{selected.name}</h4>
                <p className="text-sm text-[#0c2b40]/80">{selected.desc}</p>
                <div className="flex justify-end">
                  <button
                    onClick={() => setSelected(null)}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#081F2E] text-white px-3 py-2 text-sm hover:bg-[#0c2b40]"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CentreDashboard;