import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiZap, FiSend } from "react-icons/fi";

const SUGGESTIONS = [
  "Which centres have highest wastage this week?",
  "Forecast stock-out risk next month by vaccine.",
  "Recommend redistribution to balance regional demand.",
  "Identify centres needing cold-chain maintenance soon.",
];

const mockInsight = (query) => {
  if (!query) return "Please enter a question or pick a suggestion.";
  if (query.toLowerCase().includes("wastage")) return "Top wastage centres: Rajshahi Health Point (12%), Dhaka Medical (8%). Consider staff refresher training and stricter vial tracking.";
  if (query.toLowerCase().includes("stock-out")) return "Projected stock-out risk next month: Influenza in Sylhet (high), HepB in Khulna (medium). Send 1.2k doses to Sylhet within 10 days.";
  if (query.toLowerCase().includes("redistribution")) return "Redistribute 2k HepB doses from Chattogram surplus to Rajshahi deficit to meet demand.";
  if (query.toLowerCase().includes("cold-chain")) return "Centres needing maintenance: Chittagong Urban Clinic (sensor drift), Rajshahi Health Point (door seal). Schedule inspection.";
  return "Insight generated. Prioritize monitoring centres with rising wastage and align stock with appointment demand trajectory.";
};

const AuthorityAIInsights = () => {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const send = () => {
    setLoading(true);
    setTimeout(() => {
      setResponse(mockInsight(query));
      setLoading(false);
    }, 600);
  };

  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 260, damping: 24 }} className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#081F2E]/15 text-[#081F2E] ring-1 ring-[#081F2E]/25">
          <FiZap />
        </div>
        <h2 className="text-xl font-semibold text-[#081F2E]">AI Insights</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 rounded-2xl bg-white/70 backdrop-blur-md shadow-sm ring-1 ring-[#081F2E]/10 p-4">
          <div className="text-sm text-[#0c2b40]/80 mb-3">Suggestions</div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s, idx) => (
              <motion.button
                key={s}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setQuery(s)}
                className="text-xs rounded-full px-3 py-2 bg-[#081F2E]/7 text-[#081F2E] ring-1 ring-[#081F2E]/15 hover:bg-[#081F2E]/10"
              >
                {s}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl bg-white/70 backdrop-blur-md shadow-sm ring-1 ring-[#081F2E]/10 p-4">
            <div className="flex gap-3">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about wastage, stock, or centre performance..."
                className="flex-1 rounded-xl ring-1 ring-[#081F2E]/15 bg-white px-3 py-2 text-sm text-[#081F2E] placeholder:text-[#0c2b40]/50 focus:outline-none focus:ring-[#081F2E]/30"
              />
              <button onClick={send} className="inline-flex items-center gap-2 rounded-xl bg-[#081F2E] text-white px-3 py-2 text-sm hover:bg-[#0c2b40]">
                <FiSend />
                Send
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={loading ? "loading" : response} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="rounded-2xl bg-white/70 backdrop-blur-md shadow-sm ring-1 ring-[#081F2E]/10 p-4 min-h-[120px]">
              {loading ? (
                <div className="text-sm text-[#0c2b40]/70">Generating insights...</div>
              ) : (
                <div className="text-sm text-[#081F2E] whitespace-pre-line">{response || "Insights will appear here."}</div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.section>
  );
};

export default AuthorityAIInsights;