import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiUsers, FiPlus, FiX, FiTag } from "react-icons/fi";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

const STAFF_ROWS = [
  {
    id: "st1",
    name: "Dr. Kamal Hassan",
    assignedVaccines: ["COVID-19 Booster", "Hepatitis B"],
    history: [
      { day: "Mon", used: 18, wasted: 1 },
      { day: "Tue", used: 22, wasted: 2 },
      { day: "Wed", used: 20, wasted: 1 },
      { day: "Thu", used: 24, wasted: 2 },
      { day: "Fri", used: 26, wasted: 1 },
      { day: "Sat", used: 19, wasted: 2 },
      { day: "Sun", used: 15, wasted: 1 },
    ],
  },
  {
    id: "st2",
    name: "Nadia Rahman",
    assignedVaccines: ["Influenza Seasonal"],
    history: [
      { day: "Mon", used: 10, wasted: 1 },
      { day: "Tue", used: 12, wasted: 1 },
      { day: "Wed", used: 14, wasted: 2 },
      { day: "Thu", used: 13, wasted: 1 },
      { day: "Fri", used: 15, wasted: 2 },
      { day: "Sat", used: 9, wasted: 1 },
      { day: "Sun", used: 8, wasted: 1 },
    ],
  },
  {
    id: "st3",
    name: "Omar Siddiqui",
    assignedVaccines: ["BCG", "Tetanus"],
    history: [
      { day: "Mon", used: 8, wasted: 0 },
      { day: "Tue", used: 7, wasted: 1 },
      { day: "Wed", used: 9, wasted: 1 },
      { day: "Thu", used: 11, wasted: 1 },
      { day: "Fri", used: 10, wasted: 1 },
      { day: "Sat", used: 6, wasted: 0 },
      { day: "Sun", used: 5, wasted: 0 },
    ],
  },
];

const CentreStaff = () => {
  const [staffRows, setStaffRows] = useState(STAFF_ROWS);
  const [assignState, setAssignState] = useState({ open: false, item: null, input: "", chosen: [] });

  const SUGGESTIONS = [
    "COVID-19 Booster",
    "Influenza Seasonal",
    "Hepatitis B",
    "Tetanus",
    "BCG",
  ];

  const openAssign = (item) =>
    setAssignState({ open: true, item, input: "", chosen: item.assignedVaccines.slice(0) });
  const closeAssign = () => setAssignState({ open: false, item: null, input: "", chosen: [] });
  const addChosen = (name) =>
    setAssignState((m) =>
      m.chosen.includes(name) ? m : { ...m, chosen: [...m.chosen, name] }
    );
  const removeChosen = (name) =>
    setAssignState((m) => ({ ...m, chosen: m.chosen.filter((v) => v !== name) }));
  const commitAssign = () => {
    const item = assignState.item;
    if (!item) return closeAssign();
    setStaffRows((prev) =>
      prev.map((s) =>
        s.id === item.id ? { ...s, assignedVaccines: assignState.chosen } : s
      )
    );
    closeAssign();
  };

  const removeVaccine = (staffId, vaccineName) => {
    setStaffRows((prev) =>
      prev.map((s) =>
        s.id === staffId
          ? { ...s, assignedVaccines: s.assignedVaccines.filter((v) => v !== vaccineName) }
          : s
      )
    );
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
          <FiUsers />
        </div>
        <h2 className="text-xl font-semibold text-[#081F2E]">Staff Management</h2>
      </div>

      <div className="rounded-2xl bg-white/70 backdrop-blur-md shadow-sm ring-1 ring-[#081F2E]/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-[#0c2b40]/80">Assign vaccines and review last 7 days performance</div>
          <div className="inline-flex items-center gap-1 text-xs text-[#0c2b40]/70">
            <FiTag /> Staff · Vaccines · Usage
          </div>
        </div>
        <div className="space-y-4">
          {staffRows.map((s, idx) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              className="rounded-2xl p-5 shadow-sm ring-1 bg-gradient-to-br from-[#F8FAFF] via-white to-[#EFF6FF] ring-[#081F2E]/10"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left column: details and chips */}
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[#081F2E] font-semibold">{s.name}</div>
                      <div className="text-xs text-[#0c2b40]/80">Assigned Vaccines</div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => openAssign(s)}
                      className="inline-flex items-center gap-2 text-xs rounded-md px-3 py-1.5 bg-[#E9F9EE] text-[#1a8a35] ring-1 ring-[#2FC94E]/30 hover:bg-[#D7F3E2]"
                    >
                      <FiPlus /> Assign Vaccine
                    </motion.button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {s.assignedVaccines.map((v) => (
                      <div
                        key={v}
                        className="inline-flex items-center gap-2 text-xs rounded-md px-2 py-1 bg-[#081F2E]/5 text-[#081F2E] ring-1 ring-[#081F2E]/15"
                      >
                        <span>{v}</span>
                        <button
                          onClick={() => removeVaccine(s.id, v)}
                          className="inline-flex items-center justify-center w-4 h-4 rounded-sm bg-[#081F2E]/10 text-[#081F2E] hover:bg-[#081F2E]/15"
                          title="Remove"
                        >
                          <FiX />
                        </button>
                      </div>
                    ))}
                    {s.assignedVaccines.length === 0 && (
                      <div className="text-xs text-[#0c2b40]/70">No vaccines assigned</div>
                    )}
                  </div>
                </div>

                {/* Right column: bar chart */}
                <div className="rounded-xl bg-white ring-1 ring-[#081F2E]/10 p-4">
                  <div className="flex justify-between text-xs text-[#0c2b40]/80 mb-2">
                    <span>Last 7 days</span>
                    <span>Used vs Wasted</span>
                  </div>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={s.history} barCategoryGap={6}>
                        <XAxis dataKey="day" tick={{ fill: "#0c2b40" }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fill: "#0c2b40" }} tickLine={false} axisLine={false} />
                        <Tooltip cursor={{ fill: "#081F2E10" }} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                        <Bar dataKey="used" fill="#2FC94E" radius={[4, 4, 0, 0]} animationDuration={600} />
                        <Bar dataKey="wasted" fill="#EAB308" radius={[4, 4, 0, 0]} animationDuration={600} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Assign Vaccine Modal */}
      <AnimatePresence>
        {assignState.open && (
          <motion.div
            key="assign-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#081F2E]/40 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              key="assign-modal"
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="w-[92%] max-w-md rounded-2xl bg-white p-5 ring-1 ring-[#081F2E]/10 shadow-xl"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#E9F9EE] text-[#1a8a35] ring-1 ring-[#2FC94E]/30">
                    <FiTag />
                  </div>
                  <h4 className="text-lg font-semibold text-[#081F2E]">Assign Vaccines</h4>
                </div>
                <button onClick={closeAssign} className="text-[#081F2E]/60 hover:text-[#081F2E]">
                  <FiX />
                </button>
              </div>
              <p className="text-sm text-[#0c2b40]/80">
                Select vaccines for <span className="font-semibold text-[#081F2E]">{assignState.item?.name}</span>.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {assignState.chosen.map((v) => (
                  <div key={v} className="inline-flex items-center gap-2 text-xs rounded-md px-2 py-1 bg-[#081F2E]/5 text-[#081F2E] ring-1 ring-[#081F2E]/15">
                    <span>{v}</span>
                    <button onClick={() => removeChosen(v)} className="inline-flex items-center justify-center w-4 h-4 rounded-sm bg-[#081F2E]/10 text-[#081F2E] hover:bg-[#081F2E]/15">
                      <FiX />
                    </button>
                  </div>
                ))}
                {assignState.chosen.length === 0 && (
                  <div className="text-xs text-[#0c2b40]/70">No selection yet</div>
                )}
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {SUGGESTIONS.map((sugg) => (
                  <motion.button
                    key={sugg}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => addChosen(sugg)}
                    className="text-xs rounded-md px-3 py-1.5 ring-1 ring-[#081F2E]/15 bg-white hover:bg-[#f7f9fb] text-[#081F2E]"
                  >
                    {sugg}
                  </motion.button>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={assignState.input}
                  onChange={(e) => setAssignState((m) => ({ ...m, input: e.target.value }))}
                  className="flex-1 rounded-xl border border-[#081F2E]/20 px-3 py-2 text-sm text-[#081F2E] focus:outline-none focus:ring-2 focus:ring-[#081F2E]/40"
                  placeholder="Add custom vaccine"
                />
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => assignState.input.trim() && addChosen(assignState.input.trim())}
                  className="px-3 py-2 text-xs rounded-md bg-[#E9F9EE] text-[#1a8a35] ring-1 ring-[#2FC94E]/30 hover:bg-[#D7F3E2]"
                >
                  Add
                </motion.button>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={closeAssign}
                  className="px-3 py-1.5 text-xs rounded-md ring-1 ring-[#081F2E]/20 text-[#081F2E] bg-white hover:bg-[#f7f9fb]"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={commitAssign}
                  className="px-3 py-1.5 text-xs rounded-md bg-[#E9F9EE] text-[#1a8a35] ring-1 ring-[#2FC94E]/30 hover:bg-[#D7F3E2]"
                >
                  Save
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

export default CentreStaff;