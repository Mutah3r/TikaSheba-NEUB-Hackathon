import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  FiAlertTriangle,
  FiBell,
  FiCheckCircle,
  FiClipboard,
  FiShield,
} from "react-icons/fi";
import { getCurrentUser } from "../../services/userService";

const NOTIFICATIONS = [
  {
    id: "n1",
    title: "Stock Request Approved",
    desc: "HepB 2,000 doses approved for Rajshahi.",
    time: "2h ago",
    status: "Approved",
    accent: "#2FC94E",
    unread: true,
  },
  {
    id: "n2",
    title: "High Wastage Alert",
    desc: "Sylhet Hub reported 12% wastage yesterday.",
    time: "5h ago",
    status: "Alert",
    accent: "#F04E36",
    unread: true,
  },
  {
    id: "n3",
    title: "Cold Chain Maintenance Due",
    desc: "Chittagong Urban Clinic sensor drift flagged.",
    time: "Today",
    status: "Due",
    accent: "#EAB308",
    unread: false,
  },
  {
    id: "n4",
    title: "Centre Online",
    desc: "Dhaka Medical Centre restored connectivity.",
    time: "1d ago",
    status: "Info",
    accent: "#081F2E",
    unread: false,
  },
  {
    id: "n5",
    title: "Redistribution Suggested",
    desc: "Move 1.5k HepB doses to Rajshahi to balance demand.",
    time: "1d ago",
    status: "Suggestion",
    accent: "#2FC94E",
    unread: false,
  },
  {
    id: "n6",
    title: "Redistribution Suggested",
    desc: "Move 1.5k HepB doses to Rajshahi to balance demand.",
    time: "1d ago",
    status: "Suggestion",
    accent: "#2FC94E",
    unread: false,
  },
];

const AuthorityDashboard = () => {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const unreadCount = notifications.filter((n) => n.unread).length;
  const centresOnline = 42;
  const pendingRequests = 7;

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingUser(true);
        const data = await getCurrentUser();
        if (mounted) setUser(data);
      } catch (e) {
        // silent fail
      } finally {
        if (mounted) setLoadingUser(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="relative space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#081F2E]/15 text-[#081F2E] ring-1 ring-[#081F2E]/25">
          <FiBell />
        </div>
        <h2 className="text-xl font-semibold text-[#081F2E]">Notifications</h2>
      </div>

      {/* Two-column layout: notifications left, sidebar right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Notifications List (Aesthetic Timeline + Cards) */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl bg-white/70 backdrop-blur-md shadow-sm ring-1 ring-[#081F2E]/10">
            <ul className="relative">
              {/* Vertical timeline spine */}
              <span className="absolute left-5 top-0 bottom-0 w-px bg-[#081F2E]/10" />
              <AnimatePresence>
                {notifications.map((n, idx) => (
                  <motion.li
                    key={n.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ delay: idx * 0.05 }}
                    className="relative px-4 py-3 pl-10"
                  >
                    {/* Timeline dot */}
                    <span
                      className="absolute left-4 top-6 w-2 h-2 rounded-full ring-4 ring-white"
                      style={{ backgroundColor: n.accent }}
                    />
                    {/* Card */}
                    <div className="rounded-xl ring-1 ring-[#081F2E]/10 bg-gradient-to-br from-[#F8FAFF] via-white to-[#EFF6FF] px-4 py-3 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 text-[#081F2E]">
                          {n.status === "Approved" ? (
                            <FiCheckCircle className="text-[#2FC94E]" />
                          ) : n.status === "Alert" ? (
                            <FiAlertTriangle className="text-[#F04E36]" />
                          ) : (
                            <FiClipboard className="text-[#081F2E]" />
                          )}
                          <span className="font-medium">{n.title}</span>
                          {n.unread && (
                            <span className="ml-2 inline-flex items-center rounded-full bg-[#F04E36]/15 text-[#F04E36] text-[10px] px-2 py-0.5 ring-1 ring-[#F04E36]/20">
                              New
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-xs text-[#0c2b40]/60">{n.time}</div>
                          {n.unread && (
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => markAsRead(n.id)}
                              className="text-xs px-2 py-1 rounded-md bg-[#081F2E]/5 text-[#081F2E] ring-1 ring-[#081F2E]/15 hover:bg-[#081F2E]/10"
                              aria-label="Mark notification as read"
                            >
                              Mark as read
                            </motion.button>
                          )}
                        </div>
                      </div>
                      <p className="mt-1.5 text-sm text-[#0c2b40]/80">
                        {n.desc}
                      </p>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </div>
        </div>

        {/* Right column: Floating Sidebar (sticky) */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="sticky top-24"
          >
            <div className="w-full flex flex-col gap-3 rounded-2xl bg-white/80 backdrop-blur-xl shadow-lg ring-1 ring-[#081F2E]/15 p-4">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#081F2E]/15 text-[#081F2E] ring-1 ring-[#081F2E]/25">
                  <FiShield />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-[#081F2E] truncate">
                    {loadingUser
                      ? "Loading..."
                      : user?.name || "Authority User"}
                  </div>
                  <div className="text-xs text-[#0c2b40]/70">
                    Role: Authority
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <span className="inline-flex items-center rounded-md bg-[#E9F9EE] text-[#1a8a35] text-xs px-2 py-1 ring-1 ring-[#2FC94E]/20">
                  Centres Online: {centresOnline}
                </span>
                <span className="inline-flex items-center rounded-md bg-[#FFF7E6] text-[#A05A00] text-xs px-2 py-1 ring-1 ring-[#EAB308]/25">
                  Pending Requests: {pendingRequests}
                </span>
                <span className="inline-flex items-center rounded-md bg-[#FDECEC] text-[#F04E36] text-xs px-2 py-1 ring-1 ring-[#F04E36]/25">
                  Unread: {unreadCount}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default AuthorityDashboard;
