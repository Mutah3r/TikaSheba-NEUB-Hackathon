import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { FiClipboard, FiSend, FiCheckCircle, FiX } from "react-icons/fi";
import { listRequestedCentreVaccines, updateCentreVaccineStatus } from "../../../services/centreVaccineService";

const AuthorityStockRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await listRequestedCentreVaccines();
        // res is an array of centre_vaccine docs
        setRequests(Array.isArray(res) ? res : []);
      } catch (err) {
        console.error("Failed to load requested stocks", err);
        setError(err?.message || "Failed to load requested stocks");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const setStatusLocal = (id, requested_status) => {
    setRequests((prev) => prev.map((r) => (r._id === id ? { ...r, requested_status } : r)));
  };

  const sendRequest = async (id) => {
    try {
      const res = await updateCentreVaccineStatus(id, "sent");
      // res.data contains the updated doc per controller
      const updated = res?.data || null;
      setStatusLocal(id, updated?.requested_status || "sent");
    } catch (err) {
      console.error("Failed to mark as sent", err);
      alert(err?.message || "Failed to mark as sent");
    }
  };

  const markRequested = async (id) => {
    try {
      const res = await updateCentreVaccineStatus(id, "requested");
      const updated = res?.data || null;
      setStatusLocal(id, updated?.requested_status || "requested");
    } catch (err) {
      console.error("Failed to mark as requested", err);
      alert(err?.message || "Failed to mark as requested");
    }
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
          <FiClipboard />
        </div>
        <h2 className="text-xl font-semibold text-[#081F2E]">Stock Requests</h2>
      </div>

      <div className="rounded-2xl bg-white/70 backdrop-blur-md shadow-sm ring-1 ring-[#081F2E]/10 p-6">
        {loading ? (
          <div className="text-sm text-[#081F2E]">Loading requested stocks…</div>
        ) : error ? (
          <div className="text-sm text-red-600">{error}</div>
        ) : (
        <div className="rounded-xl bg-white ring-1 ring-[#081F2E]/10 overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-[#081F2E]/5">
              <tr>
                <th className="text-left text-xs font-semibold text-[#081F2E] px-4 py-3">Centre ID</th>
                <th className="text-left text-xs font-semibold text-[#081F2E] px-4 py-3">Vaccine Name</th>
                <th className="text-left text-xs font-semibold text-[#081F2E] px-4 py-3">Requested Amount</th>
                <th className="text-left text-xs font-semibold text-[#081F2E] px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-[#081F2E] px-4 py-3">Action</th>
              </tr>
            </thead>
            <AnimatePresence>
              <motion.tbody initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="divide-y divide-[#081F2E]/10">
                {requests.map((r, idx) => {
                  const stat = r.requested_status || "requested";
                  const badgeClass =
                    stat === "requested"
                      ? "bg-[#FFF7E6] text-[#A05A00] ring-[#EAB308]/30"
                      : "bg-[#E9F9EE] text-[#1a8a35] ring-[#2FC94E]/30";
                  return (
                    <motion.tr
                      key={r._id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="hover:bg-[#081F2E]/3"
                    >
                      <td className="px-4 py-3 text-[#081F2E] font-medium">{r.centre_id}</td>
                      <td className="px-4 py-3 text-[#0c2b40]">{r.vaccine_name}</td>
                      <td className="px-4 py-3 text-[#081F2E] font-semibold">{r.requested_stock_amount}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-2 text-xs rounded-md px-2 py-1 ring-1 ${badgeClass}`}>
                          {stat === "requested" ? <FiSend /> : <FiCheckCircle />}
                          {stat === "requested" ? "Requested" : "Sent"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => sendRequest(r._id)}
                            className="inline-flex items-center gap-2 text-xs rounded-md px-3 py-1.5 bg-[#E9F9EE] text-[#1a8a35] ring-1 ring-[#2FC94E]/30 hover:bg-[#D7F3E2]"
                          >
                            <FiSend /> Send
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => markRequested(r._id)}
                            className="inline-flex items-center gap-2 text-xs rounded-md px-3 py-1.5 bg-[#FDECEC] text-[#F04E36] ring-1 ring-[#F04E36]/30 hover:bg-[#F9D9D4]"
                          >
                            <FiX /> Mark Requested
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </motion.tbody>
            </AnimatePresence>
          </table>
        </div>
        )}
      </div>
    </motion.section>
  );
};

export default AuthorityStockRequests;