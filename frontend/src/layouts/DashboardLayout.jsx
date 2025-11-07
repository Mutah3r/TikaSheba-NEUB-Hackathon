import { useMemo, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  FiHome,
  FiMenu,
  FiLogOut,
  FiUser,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const roleSegment = useMemo(() => {
    const seg = location.pathname.split("/")[2] || localStorage.getItem("role") || "citizen";
    return seg;
  }, [location.pathname]);

  const basePath = `/dashboard/${roleSegment}`;

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
            <Link
              to={basePath}
              className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[#081F2E] hover:bg-[#081F2E]/5"
            >
              <FiHome className="text-[#081F2E]/80" />
              {!collapsed && <span>Home</span>}
            </Link>
            {/* Example extra links (non-functional for now) */}
            <button
              className="group w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[#081F2E]/70 hover:bg-[#081F2E]/5"
            >
              <FiMenu />
              {!collapsed && <span>Overview</span>}
            </button>
            <button
              className="group w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[#081F2E]/70 hover:bg-[#081F2E]/5"
            >
              <FiUser />
              {!collapsed && <span>Profile</span>}
            </button>
          </nav>
          <div className="mt-auto p-3">
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
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;