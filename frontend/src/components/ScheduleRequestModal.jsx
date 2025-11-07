import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiMapPin,
  FiSend,
  FiX,
} from "react-icons/fi";
import { getCentreCapacityNext30 } from "../services/appointmentService";

const ScheduleRequestModal = ({
  isOpen,
  onClose,
  onConfirm,
  centre,
  vaccine,
}) => {
  const startOfDay = (d) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const addDays = (d, n) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const toKey = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const today = startOfDay(new Date());
  const minDate = today;
  const maxDate = startOfDay(
    new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())
  );
  const minMonthStart = startOfDay(
    new Date(minDate.getFullYear(), minDate.getMonth(), 1)
  );
  const maxMonthStart = startOfDay(
    new Date(maxDate.getFullYear(), maxDate.getMonth(), 1)
  );

  const initialMonthStart = startOfDay(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [currentMonth, setCurrentMonth] = useState(initialMonthStart);
  const [monthDirection, setMonthDirection] = useState(0);

  const [availableSet, setAvailableSet] = useState(new Set());
  const [capacityLoading, setCapacityLoading] = useState(false);
  const [capacityError, setCapacityError] = useState("");

  useEffect(() => {
    const cid = centre?.vc_id ?? centre?.id;
    if (!isOpen || !cid) {
      setAvailableSet(new Set());
      setCapacityError("");
      setCapacityLoading(false);
      return;
    }
    let cancelled = false;
    async function fetchCapacity() {
      setCapacityLoading(true);
      setCapacityError("");
      try {
        const res = await getCentreCapacityNext30(cid);
        const list = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
          ? res.data.data
          : [];
        const set = new Set(
          list
            .filter((item) => {
              const n = Number(item?.available ?? 0);
              return Number.isFinite(n) && n > 0 && typeof item?.date === "string";
            })
            .map((item) => item.date)
        );
        if (!cancelled) setAvailableSet(set);
        if (!cancelled) setCapacityLoading(false);
      } catch (err) {
        if (!cancelled) setCapacityError(err?.message || "Failed to load availability");
        if (!cancelled) setCapacityLoading(false);
      }
    }
    fetchCapacity();
    return () => {
      cancelled = true;
    };
  }, [isOpen, centre?.vc_id, centre?.id]);

  const withinRange = (d) => d >= minDate && d <= maxDate;
  const canGoPrev = currentMonth > minMonthStart;
  const canGoNext = currentMonth < maxMonthStart;
  const goPrev = () => {
    if (!canGoPrev) return;
    setMonthDirection(-1);
    setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  };
  const goNext = () => {
    if (!canGoNext) return;
    setMonthDirection(1);
    setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));
  };

  const [selectedDate, setSelectedDate] = useState(null);

  const selectedDateStr = selectedDate
    ? selectedDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "Not selected";

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthLabel = currentMonth.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  const getCalendarCells = () => {
    const firstOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    );
    const startOffset = firstOfMonth.getDay(); // 0..6, Sunday-start
    const gridStart = addDays(firstOfMonth, -startOffset);
    const cells = [];
    for (let i = 0; i < 42; i++) {
      const d = addDays(gridStart, i);
      const inThisMonth = d.getMonth() === currentMonth.getMonth();
      const key = toKey(d);
      const allowed = withinRange(d);
      const isUnavailable = allowed && !availableSet.has(key);
      const isDisabled = !allowed || !inThisMonth || isUnavailable;
      cells.push({
        date: d,
        label: d.getDate(),
        inThisMonth,
        isUnavailable,
        isDisabled,
        isToday: toKey(d) === toKey(today),
        key,
      });
    }
    return cells;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/35" onClick={onClose} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 240, damping: 22 }}
              className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl ring-1 ring-[#F04E36]/10 overflow-hidden max-h-[85vh] flex flex-col"
            >
              <button
                onClick={onClose}
                className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#F04E36]/10 text-[#F04E36] hover:bg-[#F04E36]/20"
                aria-label="Close"
              >
                <FiX />
              </button>
              <div className="p-5 border-b border-[#081F2E]/10 flex items-center gap-3 shrink-0">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAB308]/20 text-[#EAB308]">
                  <FiSend />
                </div>
                <h3 className="text-lg font-semibold text-[#081F2E]">
                  Confirm Schedule Request
                </h3>
              </div>
              <div className="p-5 space-y-4 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 gap-3">
                  <div className="rounded-xl bg-[#081F2E]/5 p-3 ring-1 ring-[#081F2E]/10">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-[#081F2E] flex items-center gap-2">
                        <FiCalendar className="text-[#EAB308]" />
                        Select Date
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={goPrev}
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${
                            canGoPrev
                              ? "bg-[#081F2E]/10 text-[#081F2E] hover:bg-[#081F2E]/15"
                              : "bg-[#081F2E]/5 text-[#0c2b40]/40 cursor-not-allowed"
                          }`}
                          aria-label="Previous month"
                          disabled={!canGoPrev}
                        >
                          <FiChevronLeft />
                        </button>
                        <button
                          type="button"
                          onClick={goNext}
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${
                            canGoNext
                              ? "bg-[#081F2E]/10 text-[#081F2E] hover:bg-[#081F2E]/15"
                              : "bg-[#081F2E]/5 text-[#0c2b40]/40 cursor-not-allowed"
                          }`}
                          aria-label="Next month"
                          disabled={!canGoNext}
                        >
                          <FiChevronRight />
                        </button>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="text-xs font-medium text-[#0c2b40]/70">
                        {monthLabel}
                      </div>
                      <div className="text-xs text-[#0c2b40]/60">
                        Selected: {selectedDateStr}
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {dayNames.map((d) => (
                          <div
                            key={d}
                            className="text-center text-xs font-semibold text-[#0c2b40]/70"
                          >
                            {d}
                          </div>
                        ))}
                      </div>
                      <AnimatePresence initial={false} mode="wait">
                        {capacityLoading ? (
                          <motion.div
                            key="calendar-loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ type: "spring", stiffness: 240, damping: 22 }}
                            className="flex items-center justify-center h-40"
                          >
                            <div className="flex items-center gap-2 text-sm text-[#0c2b40]/70">
                              <div className="h-5 w-5 rounded-full border-2 border-[#081F2E] border-t-transparent animate-spin" />
                              Loading available days…
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div
                            key={currentMonth.toISOString()}
                            initial={{ opacity: 0, x: monthDirection * 12 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -monthDirection * 12 }}
                            transition={{ type: "spring", stiffness: 240, damping: 22 }}
                            className="grid grid-cols-7 gap-1"
                          >
                            {getCalendarCells().map((cell) => {
                              const isSelected = selectedDate && toKey(selectedDate) === cell.key;
                              const baseClasses = "relative h-9 rounded-lg ring-1 text-xs flex items-center justify-center";
                              const disabledClasses = cell.isDisabled
                                ? "bg-[#081F2E]/5 ring-[#081F2E]/10 text-[#0c2b40]/40 cursor-not-allowed"
                                : "bg-white ring-[#081F2E]/10 text-[#081F2E] hover:bg-[#081F2E]/5";
                              const unavailableClasses = cell.isUnavailable && !cell.isDisabled
                                ? "bg-[#F04E36]/10 text-[#F04E36] ring-[#F04E36]/20"
                                : "";
                              const selectedClasses = isSelected
                                ? "bg-gradient-to-r from-[#F04E36] to-[#EAB308] text-white ring-white/20"
                                : "";
                              const todayRing = cell.isToday && !isSelected ? "outline outline-1 outline-[#EAB308]/60" : "";
                              return (
                                <motion.button
                                  key={cell.key}
                                  type="button"
                                  whileHover={cell.isDisabled ? undefined : { scale: 1.02 }}
                                  whileTap={cell.isDisabled ? undefined : { scale: 0.98 }}
                                  onClick={() => {
                                    if (cell.isDisabled) return;
                                    setSelectedDate(startOfDay(cell.date));
                                  }}
                                  className={`${baseClasses} ${disabledClasses} ${unavailableClasses} ${selectedClasses} ${todayRing}`}
                                  aria-disabled={cell.isDisabled}
                                  aria-label={`Select ${cell.date.toDateString()}`}
                                >
                                  {cell.label}
                                  {cell.isUnavailable && (
                                    <span className="absolute -top-1 -right-1 inline-block h-2 w-2 rounded-full bg-[#F04E36]" />
                                  )}
                                </motion.button>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <div className="mt-3 flex items-center gap-3 text-xs">
                        <div className="inline-flex items-center gap-1 text-[#0c2b40]/60">
                          <span className="inline-block h-2 w-2 rounded-full bg-[#F04E36]" />
                          Unavailable
                        </div>
                        <div className="inline-flex items-center gap-1 text-[#0c2b40]/60">
                          <span className="inline-block h-2 w-2 rounded-sm bg-gradient-to-r from-[#F04E36] to-[#EAB308]" />
                          Selected
                        </div>
                        <div className="inline-flex items-center gap-1 text-[#0c2b40]/60">
                          <span className="inline-block h-2 w-2 rounded-sm bg-[#081F2E]/15" />
                          Disabled
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-[#0c2b40]/70">
                        Only dates from today to one month ahead are selectable.
                      </div>
                      {capacityError && (
                        <div className="mt-2 text-xs text-[#F04E36]">{capacityError}</div>
                      )}
                    </div>
                  </div>
                  <div className="rounded-xl bg-[#081F2E]/5 p-3 ring-1 ring-[#081F2E]/10">
                    <div className="text-sm font-medium text-[#081F2E] flex items-center gap-2">
                      <FiMapPin className="text-[#EAB308]" />
                      Centre
                    </div>
                    <div className="text-sm text-[#0c2b40]/80">
                      {centre?.name || "-"}
                    </div>
                    <div className="text-xs text-[#0c2b40]/70">
                      {centre?.address || "-"}
                    </div>
                  </div>
                  <div className="rounded-xl bg-[#081F2E]/5 p-3 ring-1 ring-[#081F2E]/10">
                    <div className="text-sm font-medium text-[#081F2E] flex items-center gap-2">
                      <FiSend className="text-[#EAB308]" />
                      Vaccine
                    </div>
                    <div className="text-sm text-[#0c2b40]/80">
                      {vaccine?.name || "Not selected"}
                    </div>
                    {vaccine ? (
                      <div className="text-xs text-[#0c2b40]/70">
                        Doses: {vaccine.doses}; Recommended:{" "}
                        {vaccine.recommendedAge}
                      </div>
                    ) : (
                      <div className="text-xs text-[#0c2b40]/70">
                        Please select a vaccine above.
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={onClose}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#081F2E]/10 text-[#081F2E] px-3 py-2 text-sm font-medium hover:bg-[#081F2E]/15"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => onConfirm?.({ date: selectedDate })}
                    disabled={!selectedDate}
                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${
                      selectedDate
                        ? "bg-[#F04E36] text-white hover:bg-[#d7432f]"
                        : "bg-[#081F2E]/10 text-[#0c2b40]/50 cursor-not-allowed"
                    }`}
                  >
                    <FiSend />
                    Confirm Request
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScheduleRequestModal;
