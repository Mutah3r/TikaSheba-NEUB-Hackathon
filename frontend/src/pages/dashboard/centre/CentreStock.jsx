import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { FiCheckCircle, FiDatabase, FiPackage, FiSend } from "react-icons/fi";

const STOCK = [
  {
    id: "s1",
    vaccine: "COVID-19 Booster",
    batch: "CB-2025-11",
    available: 120,
    min: 80,
  },
  {
    id: "s2",
    vaccine: "Influenza Seasonal",
    batch: "FLU-25-A",
    available: 40,
    min: 60,
  },
  {
    id: "s3",
    vaccine: "Hepatitis B",
    batch: "HB-25",
    available: 200,
    min: 100,
  },
];

// Table dataset
const STOCK_TABLE = [
  {
    vaccineId: "covid_booster",
    vaccineName: "COVID-19 Booster",
    currentStock: 120,
    requestedAmount: 80,
    requestStatus: "requested",
    totalServed: 112,
    totalAmpulesUsed: 115,
    totalAmpulesWasted: 3,
  },
  {
    vaccineId: "influenza",
    vaccineName: "Influenza Seasonal",
    currentStock: 40,
    requestedAmount: 100,
    requestStatus: "sent",
    totalServed: 54,
    totalAmpulesUsed: 56,
    totalAmpulesWasted: 2,
  },
  {
    vaccineId: "hep_b",
    vaccineName: "Hepatitis B",
    currentStock: 200,
    requestedAmount: 0,
    requestStatus: "sent",
    totalServed: 76,
    totalAmpulesUsed: 78,
    totalAmpulesWasted: 2,
  },
  {
    vaccineId: "tetanus",
    vaccineName: "Tetanus",
    currentStock: 65,
    requestedAmount: 40,
    requestStatus: "requested",
    totalServed: 31,
    totalAmpulesUsed: 32,
    totalAmpulesWasted: 1,
  },
  {
    vaccineId: "bcg",
    vaccineName: "BCG",
    currentStock: 22,
    requestedAmount: 60,
    requestStatus: "requested",
    totalServed: 22,
    totalAmpulesUsed: 23,
    totalAmpulesWasted: 1,
  },
];

const CentreStock = () => {
  const [stockRows, setStockRows] = useState(STOCK_TABLE);
  const [requestModal, setRequestModal] = useState({
    open: false,
    item: null,
    amount: "",
  });
  const [addModal, setAddModal] = useState({
    open: false,
    item: null,
    amount: "",
  });
  const [feedback, setFeedback] = useState(null);

  const openRequest = (item) =>
    setRequestModal({ open: true, item, amount: "" });
  const closeRequest = () =>
    setRequestModal({ open: false, item: null, amount: "" });
  const confirmRequest = () => {
    const item = requestModal.item;
    const amt = Math.max(0, parseInt(requestModal.amount || "0", 10));
    if (!item) return;
    setStockRows((prev) =>
      prev.map((r) =>
        r.vaccineId === item.vaccineId
          ? { ...r, requestStatus: "requested", requestedAmount: amt }
          : r
      )
    );
    setFeedback({
      type: "success",
      message: `Requested ${amt} ampules for ${item.vaccineName} (${item.vaccineId}).`,
    });
    setTimeout(() => setFeedback(null), 2200);
    closeRequest();
  };

  const openAdd = (item) => setAddModal({ open: true, item, amount: "" });
  const closeAdd = () => setAddModal({ open: false, item: null, amount: "" });
  const confirmAdd = () => {
    const amt = Math.max(0, parseInt(addModal.amount || "0", 10));
    const item = addModal.item;
    if (!item || !amt) {
      closeAdd();
      return;
    }
    setStockRows((prev) =>
      prev.map((r) =>
        r.vaccineId === item.vaccineId
          ? { ...r, currentStock: r.currentStock + amt }
          : r
      )
    );
    setFeedback({
      type: "success",
      message: `Added ${amt} ampules to ${item.vaccineName}.`,
    });
    setTimeout(() => setFeedback(null), 2200);
    closeAdd();
  };
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="space-y-6"
    >
      {/* Stock Table */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="rounded-2xl bg-white/70 backdrop-blur-md shadow-sm ring-1 ring-[#081F2E]/10 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#081F2E]/10 text-[#081F2E] ring-1 ring-[#081F2E]/20">
              <FiDatabase />
            </div>
            <h3 className="text-lg font-semibold text-[#081F2E]">
              Vaccine Stocks
            </h3>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {stockRows.map((row, idx) => {
            const statusRequested = row.requestStatus === "requested";
            const desired = row.currentStock + Math.max(0, row.requestedAmount);
            const percent =
              desired > 0
                ? Math.round((row.currentStock / desired) * 100)
                : 100;
            return (
              <motion.div
                key={row.vaccineId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
                className={
                  "rounded-2xl p-5 shadow-sm ring-1 font-bold " +
                  (statusRequested
                    ? "bg-gradient-to-br from-[#FFF5E6] via-white to-[#FFEFEA] ring-[#EAB308]/20"
                    : "bg-gradient-to-br from-[#E9F9EE] via-white to-[#D7F3E2] ring-[#2FC94E]/20")
                }
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs text-[#0c2b40]/70">
                    {row.vaccineId}
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => openRequest(row)}
                      className="inline-flex items-center gap-2 text-xs rounded-md px-3 py-1.5 bg-[#FFF5E6] text-[#A05A00] ring-1 ring-[#EAB308]/30 hover:bg-[#FFE8BF]"
                    >
                      <FiSend />
                      Request
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => openAdd(row)}
                      className="inline-flex items-center gap-2 text-xs rounded-md px-3 py-1.5 bg-[#E9F9EE] text-[#1a8a35] ring-1 ring-[#2FC94E]/30 hover:bg-[#D7F3E2]"
                    >
                      <FiPackage />
                      Add Stock
                    </motion.button>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#0c2b40]/80">Vaccine Name</span>
                    <span className="text-[#081F2E] font-bold">
                      {row.vaccineName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#0c2b40]/80">Current Stock</span>
                    <span className="text-[#081F2E] font-bold">
                      {row.currentStock}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#0c2b40]/80">Requested Stock</span>
                    <span className="text-[#081F2E] font-bold">
                      {row.requestedAmount}
                    </span>
                  </div>
                  <div className="mt-2 p-3 rounded-xl bg-[#081F2E]/5 ring-1 ring-[#081F2E]/15 flex justify-between items-center">
                    <div className="text-xs text-[#0c2b40]/70">
                      Request Status
                    </div>
                    <div
                      className={
                        "mt-1 inline-flex items-center gap-2 text-xs rounded-md px-2 py-1 ring-1 " +
                        (statusRequested
                          ? "bg-[#EAB308]/15 text-[#A05A00] ring-[#EAB308]/30"
                          : "bg-[#2FC94E]/15 text-[#1a8a35] ring-[#2FC94E]/30")
                      }
                    >
                      {statusRequested ? <FiSend /> : <FiCheckCircle />}
                      {statusRequested ? "Requested" : "Sent"}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#0c2b40]/80">Served People</span>
                    <span className="text-[#081F2E]">{row.totalServed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#0c2b40]/80">
                      Total Ampules Used
                    </span>
                    <span className="text-[#081F2E]">
                      {row.totalAmpulesUsed}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#0c2b40]/80">Ampules Wasted</span>
                    <span className="text-[#081F2E]">
                      {row.totalAmpulesWasted}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Request Confirmation Modal */}
      <AnimatePresence>
        {requestModal.open && (
          <motion.div
            key="request-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#081F2E]/40 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              key="request-modal"
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="w-[92%] max-w-md rounded-2xl bg-white p-5 ring-1 ring-[#081F2E]/10 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF5E6] text-[#A05A00] ring-1 ring-[#EAB308]/30">
                  <FiSend />
                </div>
                <h4 className="text-lg font-semibold text-[#081F2E]">
                  Confirm Stock Request
                </h4>
              </div>
              <p className="text-sm text-[#0c2b40]/80">
                Do you want to request stock for
                <span className="font-semibold text-[#081F2E]">
                  {" "}
                  {requestModal.item?.vaccineName}
                </span>{" "}
                (
                <span className="font-mono">
                  {requestModal.item?.vaccineId}
                </span>
                )?
              </p>
              <div className="mt-3">
                <input
                  type="number"
                  min="0"
                  value={requestModal.amount}
                  onChange={(e) =>
                    setRequestModal((m) => ({ ...m, amount: e.target.value }))
                  }
                  className="w-full rounded-xl border border-[#081F2E]/20 px-3 py-2 text-sm text-[#081F2E] focus:outline-none focus:ring-2 focus:ring-[#081F2E]/40"
                  placeholder="Requested ampules e.g., 50"
                />
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={closeRequest}
                  className="px-3 py-1.5 text-xs rounded-md ring-1 ring-[#081F2E]/20 text-[#081F2E] bg-white hover:bg-[#f7f9fb]"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={confirmRequest}
                  className="px-3 py-1.5 text-xs rounded-md bg-[#FFE8BF] text-[#A05A00] ring-1 ring-[#EAB308]/30 hover:bg-[#FFDFA6]"
                >
                  Confirm
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Stock Modal */}
      <AnimatePresence>
        {addModal.open && (
          <motion.div
            key="add-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#081F2E]/40 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              key="add-modal"
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="w-[92%] max-w-md rounded-2xl bg-white p-5 ring-1 ring-[#081F2E]/10 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#E9F9EE] text-[#1a8a35] ring-1 ring-[#2FC94E]/30">
                  <FiPackage />
                </div>
                <h4 className="text-lg font-semibold text-[#081F2E]">
                  Add New Stock
                </h4>
              </div>
              <p className="text-sm text-[#0c2b40]/80">
                Enter number of new ampules for
                <span className="font-semibold text-[#081F2E]">
                  {" "}
                  {addModal.item?.vaccineName}
                </span>{" "}
                (<span className="font-mono">{addModal.item?.vaccineId}</span>).
              </p>
              <div className="mt-3">
                <input
                  type="number"
                  min="0"
                  value={addModal.amount}
                  onChange={(e) =>
                    setAddModal((m) => ({ ...m, amount: e.target.value }))
                  }
                  className="w-full rounded-xl border border-[#081F2E]/20 px-3 py-2 text-sm text-[#081F2E] focus:outline-none focus:ring-2 focus:ring-[#081F2E]/40"
                  placeholder="e.g., 50"
                />
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={closeAdd}
                  className="px-3 py-1.5 text-xs rounded-md ring-1 ring-[#081F2E]/20 text-[#081F2E] bg-white hover:bg-[#f7f9fb]"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={confirmAdd}
                  className="px-3 py-1.5 text-xs rounded-md bg-[#E9F9EE] text-[#1a8a35] ring-1 ring-[#2FC94E]/30 hover:bg-[#D7F3E2]"
                >
                  Add
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback toast */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="fixed top-4 right-4 z-50 inline-flex items-center gap-2 rounded-xl bg-white/90 px-3 py-2 text-xs text-[#081F2E] ring-1 ring-[#081F2E]/15 shadow"
          >
            <span>{feedback.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

export default CentreStock;
