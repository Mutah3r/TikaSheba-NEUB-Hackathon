import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { FiMessageSquare, FiSend, FiZap } from "react-icons/fi";

const CitizenAIGuidance = () => {
  const SUGGESTIONS = [
    "I will take covid vaccine tomorrow, what side effects can I face?",
    "এক বছর বয়সের বাচ্চাদের জন্য কোন কোন টীকা গ্রহণ করা উচিত?",
    "Can I take influenza vaccine if I have a mild fever?",
    "বাচ্চের টীকা দেওয়ার পর কী করব?",
    "Is it safe to mix different COVID-19 vaccines?",
  ];

  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const mockAIResponse = (prompt) => {
    const p = prompt.toLowerCase();
    if (p.includes("side effect")) {
      return (
        "Common side effects include mild fever, fatigue, headache, and injection-site pain or swelling. " +
        "Hydrate well, rest, and use paracetamol if needed. Seek medical care if you experience high fever (\u226537.8°C), persistent chest pain, severe allergic reactions, or symptoms lasting beyond 72 hours. Common side effects include mild fever, fatigue, headache, and injection-site pain or swelling. " +
        "Hydrate well, rest, and use paracetamol if needed. Seek medical care if you experience high fever (\u226537.8°C), persistent chest pain, severe allergic reactions, or symptoms lasting beyond 72 hours. Common side effects include mild fever, fatigue, headache, and injection-site pain or swelling. " +
        "Hydrate well, rest, and use paracetamol if needed. Seek medical care if you experience high fever (\u226537.8°C), persistent chest pain, severe allergic reactions, or symptoms lasting beyond 72 hours. Common side effects include mild fever, fatigue, headache, and injection-site pain or swelling. " +
        "Hydrate well, rest, and use paracetamol if needed. Seek medical care if you experience high fever (\u226537.8°C), persistent chest pain, severe allergic reactions, or symptoms lasting beyond 72 hours. Common side effects include mild fever, fatigue, headache, and injection-site pain or swelling. " +
        "Hydrate well, rest, and use paracetamol if needed. Seek medical care if you experience high fever (\u226537.8°C), persistent chest pain, severe allergic reactions, or symptoms lasting beyond 72 hours. Common side effects include mild fever, fatigue, headache, and injection-site pain or swelling. " +
        "Hydrate well, rest, and use paracetamol if needed. Seek medical care if you experience high fever (\u226537.8°C), persistent chest pain, severe allergic reactions, or symptoms lasting beyond 72 hours. Common side effects include mild fever, fatigue, headache, and injection-site pain or swelling. " +
        "Hydrate well, rest, and use paracetamol if needed. Seek medical care if you experience high fever (\u226537.8°C), persistent chest pain, severe allergic reactions, or symptoms lasting beyond 72 hours. Common side effects include mild fever, fatigue, headache, and injection-site pain or swelling. " +
        "Hydrate well, rest, and use paracetamol if needed. Seek medical care if you experience high fever (\u226537.8°C), persistent chest pain, severe allergic reactions, or symptoms lasting beyond 72 hours. Common side effects include mild fever, fatigue, headache, and injection-site pain or swelling. " +
        "Hydrate well, rest, and use paracetamol if needed. Seek medical care if you experience high fever (\u226537.8°C), persistent chest pain, severe allergic reactions, or symptoms lasting beyond 72 hours. Common side effects include mild fever, fatigue, headache, and injection-site pain or swelling. " +
        "Hydrate well, rest, and use paracetamol if needed. Seek medical care if you experience high fever (\u226537.8°C), persistent chest pain, severe allergic reactions, or symptoms lasting beyond 72 hours."
      );
    }
    if (p.includes("schedule") || p.includes("bcg") || p.includes("mmr")) {
      return (
        "Typical schedule: BCG at birth; MMR at 9 months with a second dose at 15 months (varies by program). " +
        "Always follow your local immunization guidelines and your clinician’s advice."
      );
    }
    if (p.includes("fever") || p.includes("influenza") || p.includes("flu")) {
      return "If you have a mild fever, consider postponing vaccination until recovered. Mild cold symptoms may be acceptable, but active fever is usually a temporary contraindication. Consult your clinician for the safest timing.";
    }
    if (p.includes("avoid") || p.includes("after")) {
      return "After vaccination: avoid heavy exercise for 24 hours, monitor for side effects, keep the injection site clean and dry, and avoid alcohol if advised. If you feel unwell, rest and seek care if symptoms worsen.";
    }
    if (p.includes("mix") || p.includes("different")) {
      return "Mixing vaccine brands may be permissible in some programs (e.g., certain COVID-19 schedules), but follow official guidance and clinician advice. Prefer consistent brands unless medically directed.";
    }
    return "I can provide general guidance. For personalized recommendations, please consult a healthcare professional or follow your local immunization schedule.";
  };

  const onSend = () => {
    const prompt = input.trim();
    if (!prompt) return;
    setLoading(true);
    // Simulate AI processing
    setTimeout(() => {
      const res = mockAIResponse(prompt);
      setResponse(res);
      setLoading(false);
    }, 650);
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
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAB308]/20 text-[#EAB308] ring-1 ring-[#EAB308]/30">
          <FiMessageSquare />
        </div>
        <h2 className="text-xl font-semibold text-[#081F2E]">
          Get AI Guidance
        </h2>
      </div>

      {/* Container */}
      <div className="rounded-2xl bg-white/70 backdrop-blur-md shadow-sm ring-1 ring-[#081F2E]/10 p-6">
        <div className="text-sm text-[#0c2b40]/80 mb-4">
          Ask vaccine-related questions or tap a suggested prompt below. The AI
          response will appear above the text box.
        </div>

        {/* Response area (appears above composer) */}
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
              className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-medium text-[#081F2E] ring-1 ring-[#081F2E]/15 shadow-sm"
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

      {/* Floating composer at bottom */}
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
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow ring-1 ring-white/10 ${
                !input.trim() || loading
                  ? "bg-[#081F2E]/30 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#F04E36] to-[#EAB308] hover:opacity-90"
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

export default CitizenAIGuidance;
