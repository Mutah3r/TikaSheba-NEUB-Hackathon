import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { askCenterChat } from "../../../services/aiService";
import { FiMessageSquare, FiSend, FiZap } from "react-icons/fi";

const SUGGESTIONS = [
  "হেপাটাইটিস বি ভ্যাকসিন কীভাবে সংরক্ষণ করতে হবে?",
  "পোলিও ভ্যাকসিন সংরক্ষণের আদর্শ তাপমাত্রা কত?",
  "Can the tetanus vaccine be kept outside the refrigerator?",
  "প্রস্তুত করার পর পুনর্গঠিত হামের ভ্যাকসিন কতক্ষণ পর্যন্ত ব্যবহার করা যায়?",
  "What precautions should be taken during the transportation of vaccines?",
];

const CentreAIInsights = () => {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const onSend = async () => {
    const prompt = input.trim();
    if (!prompt) return;
    setLoading(true);
    setResponse("");
    try {
      const res = await askCenterChat(prompt);
      const text =
        typeof res === "string"
          ? res
          : res?.message || res?.response || JSON.stringify(res);
      setResponse(text);
    } catch (err) {
      setResponse(
        err?.response?.data?.message || err?.message || "Failed to fetch AI response."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="space-y-6 pb-28"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#081F2E]/15 text-[#081F2E] ring-1 ring-[#081F2E]/25">
          <FiMessageSquare />
        </div>
        <h2 className="text-xl font-semibold text-[#081F2E]">
          Get AI Insights On Vaccine Preservation
        </h2>
      </div>

      {/* Container */}
      <div className="rounded-2xl bg-white/70 backdrop-blur-md shadow-sm ring-1 ring-[#081F2E]/10 p-6">
        <div className="text-sm text-[#0c2b40]/80 mb-4">
          Ask vaccine-preservation related questions or tap a suggested prompt
          below. The AI response will appear above the text box.
        </div>

        {/* Response area */}
        <AnimatePresence>
          {response && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="rounded-xl bg-white ring-1 ring-[#081F2E]/10 p-4 mb-4"
            >
              <div className="flex items-center gap-2 mb-2 text-[#081F2E] font-medium">
                <div className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#081F2E]/10 text-[#081F2E]">
                  <FiZap />
                </div>
                AI Guidance
              </div>
              <div className="text-sm text-[#0c2b40]/80 leading-relaxed">
                {response}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Suggestions */}
        <div className="mb-2 text-xs text-[#0c2b40]/60">Suggestions</div>
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <motion.button
              key={s}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setInput(s)}
              className="inline-flex items-center gap-2 rounded-lg bg:white px-3 py-2 text-xs font-medium text-[#081F2E] ring-1 ring-[#081F2E]/15 shadow-sm bg-white"
            >
              <span className="inline-flex items-center gap-1 rounded-md px-2 py-1 bg-[#EAB308]/15 text-[#EAB308] ring-1 ring-[#EAB308]/20">
                <FiZap />
                Ask
              </span>
              {s}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Floating composer */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="sticky bottom-4 z-40"
      >
        <div className="w-full rounded-2xl bg-white/90 backdrop-blur-md shadow-lg ring-1 ring-[#081F2E]/10 p-3">
          <div className="flex items-end gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={2}
              placeholder="Type your question..."
              className="flex-1 resize-none rounded-xl bg-white px-3 py-2 text-sm text-[#081F2E] placeholder:text-[#081F2E]/50 ring-1 ring-[#081F2E]/10 focus:outline-none focus:ring-2 focus:ring-[#EAB308]/40"
            />
            <motion.button
              whileHover={{ scale: input.trim() ? 1.02 : 1 }}
              whileTap={{ scale: input.trim() ? 0.98 : 1 }}
              disabled={!input.trim() || loading}
              onClick={onSend}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text:white shadow ring-1 ring-white/10 ${
                !input.trim() || loading
                  ? "bg-[#081F2E]/30 cursor-not-allowed text-white"
                  : "bg-gradient-to-r from-[#F04E36] to-[#EAB308] hover:opacity-90 text-white"
              }`}
            >
              <FiSend />
              {loading ? "Sending..." : "Send"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
};

export default CentreAIInsights;
