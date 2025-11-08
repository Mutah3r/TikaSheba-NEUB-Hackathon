import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { FiBell, FiCalendar, FiClipboard, FiUsers, FiX } from "react-icons/fi";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getCurrentUser } from "../../../services/userService";
import { getTodaysScheduledByCentre, getScheduledCountsNext14 } from "../../../services/appointmentService";

const PRIMARY = "#081F2E";
const ACCENT = "#EAB308";
const BAR_COLOR = "#2FC94E"; // matches centre dashboard weekly chart

// -- Two-week bar chart component --

// Replaced by todayPatients loaded from API
const SCHEDULED_PATIENTS = [];

const SAMPLE_NAMES = [
  "Rahim Uddin",
  "Sara Noor",
  "Imran Khan",
  "Aisha Rahman",
  "Jamal Hossain",
  "Farhana Akter",
  "Nadia Islam",
  "Tanvir Ahmed",
  "Mizanur Rahman",
  "Shahida Begum",
  "Arif Chowdhury",
  "Mahbub Alam",
];

const SAMPLE_VACCINES = [
  "COVID-19 Booster",
  "Hepatitis B",
  "Influenza Seasonal",
  "Tetanus",
  "BCG",
  "Typhoid",
];

function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateAppointmentsForDate(date) {
  if (!date) return [];
  const key = parseInt(
    `${date.getFullYear()}${date.getMonth() + 1}${date.getDate()}`,
    10
  );
  const count = 4 + Math.floor(seededRandom(key) * 8); // 4..11
  const startHour = 9;
  const items = [];
  for (let i = 0; i < count; i++) {
    const name = SAMPLE_NAMES[(key + i) % SAMPLE_NAMES.length];
    const vaccine = SAMPLE_VACCINES[(key + i * 3) % SAMPLE_VACCINES.length];
    const hour = startHour + (i % 8);
    const minute = (i % 2) * 30;
    const time = `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;
    items.push({ id: `appt-${key}-${i}`, name, vaccine, time });
  }
  return items;
}

const FutureDatePicker = ({ selectedDate, onDateChange }) => {
  const today = new Date();
  const minDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1
  );
  const maxDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 30
  );
  const [viewMonth, setViewMonth] = useState(
    (selectedDate || minDate).getMonth()
  );
  const [viewYear, setViewYear] = useState(
    (selectedDate || minDate).getFullYear()
  );

  const days = useMemo(() => {
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const startDayIdx = firstOfMonth.getDay(); // 0=Sun
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const grid = [];
    // Fill leading blanks
    for (let i = 0; i < startDayIdx; i++) grid.push(null);
    // Fill month days
    for (let d = 1; d <= daysInMonth; d++) {
      grid.push(new Date(viewYear, viewMonth, d));
    }
    // Pad to complete weeks (up to 42 cells)
    while (grid.length % 7 !== 0) grid.push(null);
    return grid;
  }, [viewMonth, viewYear]);

  const isDisabled = (d) => !d || d < minDate || d > maxDate;
  const isSelected = (d) =>
    selectedDate &&
    d &&
    d.getFullYear() === selectedDate.getFullYear() &&
    d.getMonth() === selectedDate.getMonth() &&
    d.getDate() === selectedDate.getDate();

  const goPrevMonth = () => {
    const prev = new Date(viewYear, viewMonth - 1, 1);
    // Prevent navigating before minDate's month
    const minMonthStart = new Date(
      minDate.getFullYear(),
      minDate.getMonth(),
      1
    );
    if (prev < minMonthStart) return;
    setViewMonth(prev.getMonth());
    setViewYear(prev.getFullYear());
  };
  const goNextMonth = () => {
    const next = new Date(viewYear, viewMonth + 1, 1);
    const maxMonthStart = new Date(
      maxDate.getFullYear(),
      maxDate.getMonth(),
      1
    );
    if (next > maxMonthStart) return;
    setViewMonth(next.getMonth());
    setViewYear(next.getFullYear());
  };

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString(
    "en-GB",
    { month: "long", year: "numeric" }
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="rounded-2xl bg-white/70 backdrop-blur-md shadow-sm ring-1 ring-[#081F2E]/10 p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#081F2E]/10 text-[#081F2E] ring-1 ring-[#081F2E]/20">
            <FiCalendar />
          </div>
          <span className="text-sm font-medium text-[#081F2E]">
            {monthLabel}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goPrevMonth}
            className="px-2 py-1 text-xs rounded-md bg-[#081F2E]/5 text-[#081F2E] ring-1 ring-[#081F2E]/15 hover:bg-[#081F2E]/10"
          >
            Prev
          </button>
          <button
            onClick={goNextMonth}
            className="px-2 py-1 text-xs rounded-md bg-[#081F2E]/5 text-[#081F2E] ring-1 ring-[#081F2E]/15 hover:bg-[#081F2E]/10"
          >
            Next
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2 text-xs mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="text-center text-[#0c2b40]/70">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((d, idx) => {
          const disabled = isDisabled(d);
          const selected = isSelected(d);
          return (
            <button
              key={idx}
              disabled={disabled}
              onClick={() => !disabled && onDateChange && onDateChange(d)}
              className={
                "h-8 rounded-md ring-1 transition " +
                (disabled
                  ? "ring-[#081F2E]/10 text-[#0c2b40]/40 cursor-not-allowed"
                  : selected
                  ? "bg-[#EAB308]/20 ring-[#EAB308]/40 text-[#081F2E]"
                  : "bg-white ring-[#081F2E]/10 text-[#081F2E] hover:bg-[#081F2E]/5")
              }
            >
              {d ? d.getDate() : ""}
            </button>
          );
        })}
      </div>
      <div className="mt-3 text-[11px] text-[#0c2b40]/60">
        Select a future date within next 30 days.
      </div>
    </motion.div>
  );
};

const ChartTwoWeeks = ({ data = [], capacity = 40 }) => {
  const yMax = useMemo(() => {
    if (!data.length) return 10;
    const maxVal = Math.max(...data.map((d) => d.scheduled), capacity);
    return maxVal + 6;
  }, [data, capacity]);

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 12, right: 12, left: 12, bottom: 12 }}
        >
          <CartesianGrid
            stroke={PRIMARY}
            strokeOpacity={0.1}
            vertical={false}
          />
          <XAxis
            dataKey="day"
            tick={{ fill: PRIMARY, fontSize: 12 }}
            axisLine={{ stroke: PRIMARY, strokeOpacity: 0.2 }}
            tickLine={{ stroke: PRIMARY, strokeOpacity: 0.2 }}
          />
          <YAxis
            domain={[0, yMax]}
            tick={{ fill: PRIMARY, fontSize: 12 }}
            axisLine={{ stroke: PRIMARY, strokeOpacity: 0.2 }}
            tickLine={{ stroke: PRIMARY, strokeOpacity: 0.2 }}
          />
          <Tooltip
            cursor={{ fill: PRIMARY, fillOpacity: 0.04 }}
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid rgba(8,31,46,0.15)",
              borderRadius: 12,
            }}
            labelStyle={{ color: PRIMARY }}
            itemStyle={{ color: PRIMARY }}
          />
          <ReferenceLine
            y={capacity}
            stroke={PRIMARY}
            strokeDasharray="4 4"
            label={{
              value: `Capacity (${capacity})`,
              position: "right",
              fill: PRIMARY,
            }}
          />
          <Bar
            dataKey="scheduled"
            fill={BAR_COLOR}
            stroke={BAR_COLOR}
            isAnimationActive
            animationDuration={700}
          >
            <LabelList
              dataKey="scheduled"
              position="top"
              style={{ fill: PRIMARY, fontSize: 11 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const CentreAppointments = () => {
  const [futureOpen, setFutureOpen] = useState(false);
  const [selectedFutureDate, setSelectedFutureDate] = useState(null);
  const [notifySent, setNotifySent] = useState(false);
  const [todayPatients, setTodayPatients] = useState([]);
  const [todayLoading, setTodayLoading] = useState(true);
  const [todayError, setTodayError] = useState("");
  const [next14, setNext14] = useState([]);
  const [graphLoading, setGraphLoading] = useState(true);
  const graphData = useMemo(() => {
    const days = next14.map((d) => {
      const dateObj = new Date(d.date);
      const label = dateObj.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
      });
      return { day: label, scheduled: d.scheduled || d.scheduled_count || 0 };
    });
    return days;
  }, [next14]);
  const todaysCount = todayPatients.length;

  useEffect(() => {
    let mounted = true;
    async function loadToday() {
      try {
        setTodayLoading(true);
        setTodayError("");
        const user = await getCurrentUser();
        const vcId = user?.vc_id;
        if (!vcId) throw new Error("Missing centre ID for current user");
        const items = await getTodaysScheduledByCentre(vcId);
        if (!mounted) return;
        const normalized = Array.isArray(items)
          ? items.map((a, idx) => ({
              id: a._id || `appt-${idx}`,
              name: a.citizen_name || a.citizen_id || "Unknown Citizen",
              vaccine: a.vaccine_name || "Unknown Vaccine",
            }))
          : [];
        setTodayPatients(normalized);
      } catch (err) {
        if (!mounted) return;
        setTodayError(err?.message || "Failed to load today's scheduled patients");
      } finally {
        if (mounted) setTodayLoading(false);
      }
    }
    loadToday();
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch next 14-day scheduled counts for graph
  useEffect(() => {
    let mounted = true;
    async function loadNext14() {
      try {
        setGraphLoading(true);
        const res = await getScheduledCountsNext14();
        if (!mounted) return;
        const list = Array.isArray(res?.days) ? res.days : res;
        setNext14(list);
      } catch (err) {
        if (!mounted) return;
        console.error("Failed to load next 14 days graph", err);
      } finally {
        if (mounted) setGraphLoading(false);
      }
    }
    loadNext14();
    return () => {
      mounted = false;
    };
  }, []);

  const futureAppointments = useMemo(
    () => generateAppointmentsForDate(selectedFutureDate),
    [selectedFutureDate]
  );

  const openFutureModal = () => {
    setSelectedFutureDate(null);
    setFutureOpen(true);
    setNotifySent(false);
  };
  const closeFutureModal = () => setFutureOpen(false);
  const sendNotification = () => {
    if (!futureAppointments.length) return;
    setNotifySent(true);
    setTimeout(() => setNotifySent(false), 3000);
  };
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="space-y-6"
    >
      {/* Header with Future Appointments button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAB308]/20 text-[#EAB308] ring-1 ring-[#EAB308]/30">
            <FiClipboard />
          </div>
          <h2 className="text-xl font-semibold text-[#081F2E]">
            View Appointments
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openFutureModal}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#081F2E] text-white ring-1 ring-[#081F2E]/20 shadow-sm"
          >
            <FiCalendar />
            <span className="text-sm">Future Appointments</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openFutureModal}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#EAB308] text-[#081F2E] ring-1 ring-[#EAB308]/30 shadow-sm"
          >
            <FiBell />
            <span className="text-sm">Send Notification</span>
          </motion.button>
        </div>
      </div>

      {/* Future Appointments Modal */}
      <AnimatePresence>
        {futureOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#081F2E]/30 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="max-w-5xl w-full max-h-[85vh] rounded-2xl bg-white/80 backdrop-blur-md shadow-lg ring-1 ring-[#081F2E]/10 flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 shrink-0 border-b border-[#081F2E]/10">
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#081F2E]/10 text-[#081F2E] ring-1 ring-[#081F2E]/20">
                    <FiClipboard />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#081F2E]">
                      Future Appointments
                    </h3>
                    <div className="text-xs text-[#0c2b40]/70">
                      {selectedFutureDate
                        ? selectedFutureDate.toLocaleDateString("en-GB", {
                            weekday: "short",
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "Select a date to view appointments"}
                    </div>
                  </div>
                </div>
                <button
                  onClick={closeFutureModal}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#081F2E]/10 text-[#081F2E] ring-1 ring-[#081F2E]/20 hover:bg-[#081F2E]/15"
                >
                  <FiX />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-4 flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left: Appointment List */}
                  <div className="rounded-2xl bg-white/70 backdrop-blur-md shadow-sm ring-1 ring-[#081F2E]/10 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-medium text-[#081F2E]">
                        Appointments
                      </div>
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          disabled={
                            !selectedFutureDate ||
                            futureAppointments.length === 0
                          }
                          onClick={sendNotification}
                          className={
                            "inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm ring-1 shadow-sm " +
                            (!selectedFutureDate ||
                            futureAppointments.length === 0
                              ? "bg-[#081F2E]/10 text-[#081F2E]/50 ring-[#081F2E]/15 cursor-not-allowed"
                              : "bg-[#EAB308] text-[#081F2E] ring-[#EAB308]/30 hover:bg-[#EAB308]/90")
                          }
                        >
                          <FiBell />
                          Send Notification
                        </motion.button>
                      </div>
                    </div>

                    {notifySent && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="mb-3 text-xs inline-flex items-center gap-2 px-2 py-1 rounded-md bg-[#2FC94E]/15 text-[#081F2E] ring-1 ring-[#2FC94E]/30"
                      >
                        Notifications queued for {futureAppointments.length}{" "}
                        users
                      </motion.div>
                    )}

                    <div className="space-y-3">
                      {!selectedFutureDate && (
                        <div className="text-xs text-[#0c2b40]/70">
                          Select a date from the picker to load appointments.
                        </div>
                      )}
                      {selectedFutureDate &&
                        futureAppointments.length === 0 && (
                          <div className="text-xs text-[#0c2b40]/70">
                            No appointments found for the selected date.
                          </div>
                        )}
                      <AnimatePresence initial={false}>
                        {futureAppointments.map((p, idx) => (
                          <motion.div
                            key={p.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{
                              type: "spring",
                              stiffness: 260,
                              damping: 24,
                              delay: idx * 0.03,
                            }}
                            className="rounded-xl bg-white ring-1 ring-[#081F2E]/10 p-4 flex items-center justify-between hover:bg-[#081F2E]/3"
                          >
                            <div>
                              <div className="text-[#081F2E] font-semibold">
                                {p.name}
                              </div>
                              <div className="text-xs text-[#0c2b40]/70">
                                Time: {p.time}
                              </div>
                            </div>
                            <span className="inline-flex items-center rounded-md px-2 py-1 text-xs bg-[#EAB308]/15 text-[#EAB308] ring-1 ring-[#EAB308]/25">
                              {p.vaccine}
                            </span>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Right: Date Picker */}
                  <div className="md:order-last">
                    <FutureDatePicker
                      selectedDate={selectedFutureDate}
                      onDateChange={(d) => setSelectedFutureDate(d)}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scheduled Patients */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="rounded-2xl bg-white/70 backdrop-blur-md shadow-sm ring-1 ring-[#081F2E]/10 p-6"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#081F2E]/10 text-[#081F2E] ring-1 ring-[#081F2E]/20">
              <FiUsers />
            </div>
            <h3 className="text-lg font-semibold text-[#081F2E]">
              Today's Scheduled Patients
            </h3>
          </div>
          <span className="inline-flex items-center rounded-md px-2 py-1 text-xs bg-[#081F2E]/5 text-[#081F2E] ring-1 ring-[#081F2E]/15">
            Total: {todaysCount}
          </span>
        </div>
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {todayLoading && (
              <div className="text-xs text-[#0c2b40]/70">Loading...</div>
            )}
            {todayError && (
              <div className="text-xs text-red-600">{todayError}</div>
            )}
            {!todayLoading && !todayError && todayPatients.length === 0 && (
              <div className="text-xs text-[#0c2b40]/70">No scheduled patients for today.</div>
            )}
            {todayPatients.map((p, idx) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 24,
                  delay: idx * 0.04,
                }}
                className="rounded-xl bg-white ring-1 ring-[#081F2E]/10 p-4 flex items-center justify-between hover:bg-[#081F2E]/3"
              >
                <div>
                  <div className="text-[#081F2E] font-semibold">{p.name}</div>
                  <div className="text-xs text-[#0c2b40]/70">Scheduled</div>
                </div>
                <span className="inline-flex items-center rounded-md px-2 py-1 text-xs bg-[#EAB308]/15 text-[#EAB308] ring-1 ring-[#EAB308]/25">
                  {p.vaccine}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Scheduling (Next 2 Weeks) */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="rounded-2xl bg-white/70 backdrop-blur-md shadow-sm ring-1 ring-[#081F2E]/10 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#081F2E]/10 text-[#081F2E] ring-1 ring-[#081F2E]/20">
              <FiClipboard />
            </div>
            <h3 className="text-lg font-semibold text-[#081F2E]">
              Scheduling (Next 2 Weeks)
            </h3>
          </div>
        </div>

        {/* Chart */}
        {!graphLoading && <ChartTwoWeeks data={graphData} capacity={40} />}
      </motion.div>
    </motion.section>
  );
};

export default CentreAppointments;
