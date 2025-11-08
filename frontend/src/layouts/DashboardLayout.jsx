import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  FiActivity,
  FiBarChart2,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiClipboard,
  FiDatabase,
  FiHome,
  FiLogOut,
  FiMessageSquare,
  FiSettings,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import { GoDependabot } from "react-icons/go";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { getCurrentUser } from "../services/userService";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  const roleSegment = useMemo(() => {
    const seg =
      location.pathname.split("/")[2] ||
      localStorage.getItem("role") ||
      "citizen";
    return seg;
  }, [location.pathname]);

  const basePath = `/dashboard/${roleSegment}`;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setUserLoading(true);
        const data = await getCurrentUser();
        if (mounted) setUser(data);
      } catch (e) {
        // fail silently for now; can integrate Notification later
      } finally {
        if (mounted) setUserLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const navItems = useMemo(() => {
    if (roleSegment === "citizen") {
      return [
        { to: basePath, label: "Home", icon: FiHome },
        {
          to: `${basePath}/schedule`,
          label: "Schedule Vaccine",
          icon: FiCalendar,
        },
        {
          to: `${basePath}/appointments`,
          label: "My Appointments",
          icon: FiClipboard,
        },
        // { to: `${basePath}/logs`, label: "Logs", icon: FiActivity },
        {
          to: `${basePath}/ai`,
          label: "Get AI Guidance",
          icon: FiMessageSquare,
        },
      ];
    }
    if (roleSegment === "authority") {
      return [
        { to: basePath, label: "Home", icon: FiHome },
        { to: `${basePath}/vaccines`, label: "Vaccines", icon: FiDatabase },
        { to: `${basePath}/centres`, label: "Vaccine Centres", icon: FiUsers },
        {
          to: `${basePath}/requests`,
          label: "Stock Requests",
          icon: FiClipboard,
        },
        {
          to: `${basePath}/visualization`,
          label: "Visualization",
          icon: FiBarChart2,
        },
        { to: `${basePath}/ai`, label: "AI Insights", icon: FiMessageSquare },
      ];
    }
    // vacc_centre / centre role
    return [
      { to: basePath, label: "Home", icon: FiHome },
      {
        to: `${basePath}/appointments`,
        label: "View Appointments",
        icon: FiClipboard,
      },
      { to: `${basePath}/stock`, label: "Vaccine Stock", icon: FiDatabase },
      {
        to: `${basePath}/forecast`,
        label: "Forecasting",
        icon: FiBarChart2,
      },
      { to: `${basePath}/staff`, label: "Staff Management", icon: FiUsers },
      { to: `${basePath}/logs`, label: "Logs", icon: FiActivity },
      {
        to: `${basePath}/insights`,
        label: "Preservation Guidance",
        icon: GoDependabot,
      },
    ];
  }, [roleSegment, basePath]);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("role");
    navigate("/auth/login");
  };

  return (
    <div className="h-screen w-full bg-gradient-to-br from-[#fff7f5] via-[#fffaf0] to-[#fffef7] text-[#081F2E] overflow-hidden">
      {/* Top Navbar */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 22 }}
        className="h-16 flex items-center justify-between px-4 sm:px-6 bg-white/70 backdrop-blur-md shadow-sm ring-1 ring-[#F04E36]/10"
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-[#F04E36]/10 text-[#F04E36] hover:bg-[#F04E36]/20"
            aria-label="Toggle sidebar"
          >
            {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
          </button>
          <Link to={basePath} className="font-semibold tracking-wide text-lg">
            TikaSheba
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-[#0c2b40]/70 hidden sm:block capitalize">
            {roleSegment}
          </div>
          {user && (
            <motion.span
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
              className="hidden sm:block text-sm font-medium text-[#081F2E]"
            >
              {String(user?.name || "").split(" ")[0]}
            </motion.span>
          )}
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#EAB308]/20 text-[#EAB308] ring-1 ring-[#EAB308]/30">
            <FiUser />
          </div>
        </div>
      </motion.header>

      {/* Body: Sidebar + Content */}
      <div className="h-[calc(100vh-4rem)] flex overflow-hidden">
        {/* Sidebar */}
        <motion.aside
          initial={false}
          animate={{ width: collapsed ? 72 : 240 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          className="h-full bg-white shadow-lg ring-1 ring-[#081F2E]/10 overflow-y-auto flex flex-col"
        >
          <nav className="p-3 space-y-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === basePath}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 ` +
                  (isActive
                    ? `text-[#081F2E] bg-gradient-to-r from-[#081F2E]/10 to-transparent ring-1 ring-[#081F2E]/10`
                    : `text-[#081F2E] hover:bg-[#081F2E]/5`)
                }
              >
                <Icon
                  className={
                    (
                      to === basePath
                        ? location.pathname === to
                        : location.pathname.startsWith(to)
                    )
                      ? "text-[#F04E36]"
                      : "text-[#081F2E]/80"
                  }
                />
                {!collapsed && <span>{label}</span>}
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto p-3">
            {/* Settings above Logout for citizen */}
            {roleSegment === "citizen" && (
              <NavLink
                to={`${basePath}/settings`}
                className={({ isActive }) =>
                  `mb-2 w-full inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 ` +
                  (isActive
                    ? `bg-[#081F2E]/10 text-[#081F2E] ring-1 ring-[#081F2E]/10`
                    : `bg-white text-[#081F2E] ring-1 ring-[#081F2E]/10 hover:bg-[#081F2E]/5`)
                }
              >
                <FiSettings
                  className={
                    location.pathname.startsWith(`${basePath}/settings`)
                      ? "text-[#F04E36]"
                      : "text-[#081F2E]/80"
                  }
                />
                {!collapsed && <span>Settings</span>}
              </NavLink>
            )}
            <button
              onClick={handleLogout}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#F04E36] text-white px-3 py-2 text-sm font-medium hover:bg-[#e3452f]"
            >
              <FiLogOut />
              {!collapsed && <span>Logout</span>}
            </button>
          </div>
        </motion.aside>

        {/* Main content */}
        <main className="flex-1 h-full overflow-y-auto">
          <div className="p-4 sm:p-6">
            <Outlet context={{ user }} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
