import { motion } from "framer-motion";
import { FiBarChart2 } from "react-icons/fi";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

const COVERAGE = [
  { region: "Dhaka", coverage: 82 },
  { region: "Chattogram", coverage: 74 },
  { region: "Rajshahi", coverage: 68 },
  { region: "Khulna", coverage: 71 },
  { region: "Sylhet", coverage: 77 },
];

const AuthorityVisualization = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#081F2E]/15 text-[#081F2E] ring-1 ring-[#081F2E]/25">
          <FiBarChart2 />
        </div>
        <h2 className="text-xl font-semibold text-[#081F2E]">Visualization</h2>
      </div>

      <div className="rounded-2xl bg-white/70 backdrop-blur-md shadow-sm ring-1 ring-[#081F2E]/10 p-6">
        <div className="text-sm text-[#0c2b40]/80 mb-3">Regional Coverage (Sample)</div>
        <div className="h-64 rounded-xl bg-white ring-1 ring-[#081F2E]/10 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={COVERAGE} barCategoryGap={8}>
              <XAxis dataKey="region" tick={{ fill: "#0c2b40" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: "#0c2b40" }} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: "#081F2E10" }} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="coverage" fill="#2FC94E" radius={[6, 6, 0, 0]} animationDuration={600} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.section>
  );
};

export default AuthorityVisualization;