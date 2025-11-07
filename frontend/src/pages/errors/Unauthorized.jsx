import { motion } from "framer-motion";
import { useMemo } from "react";
import { FiArrowLeft, FiHome, FiShieldOff } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router";

function Unauthorized() {
  const navigate = useNavigate();
  const location = useLocation();
  const role =
    typeof window !== "undefined" ? localStorage.getItem("role") : null;

  const requiredRole = location?.state?.required || null;

  const myDashboardPath = useMemo(() => {
    if (role === "citizen") return "/dashboard/citizen";
    if (role === "authority") return "/dashboard/authority";
    if (role === "centre" || role === "vcc_centre") return "/dashboard/centre";
    return "/dashboard";
  }, [role]);

  return (
    <div className="min-h-[60vh] grid place-items-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 18 }}
        className="relative max-w-xl w-full rounded-2xl border border-[#0c2b40]/10 bg-white shadow-xl overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFF5E6] via-white to-[#FFEFEA] pointer-events-none" />
        <div className="relative p-6 sm:p-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.05 }}
            className="flex items-center gap-3"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#F04E36]/10 text-[#F04E36]">
              <FiShieldOff className="text-2xl" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-[#081F2E]">
                Access Denied
              </h2>
              <p className="text-sm text-[#0c2b40]/70">
                You do not have permission to view this page.
              </p>
            </div>
          </motion.div>

          {requiredRole && (
            <p className="mt-4 text-sm text-[#0c2b40]/70">
              This route requires{" "}
              <span className="font-medium text-[#0c2b40]">{requiredRole}</span>{" "}
              access.
            </p>
          )}

          <div className="mt-6 grid gap-3 sm:flex sm:items-center sm:gap-4">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-xl border border-[#0c2b40]/15 bg-white px-4 py-2 text-[#081F2E] hover:bg-[#f8fafc]"
            >
              <FiArrowLeft /> Go back
            </button>
            <button
              onClick={() => navigate(myDashboardPath)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#EAB308] text-[#081F2E] px-4 py-2 font-medium hover:bg-[#d7a106]"
            >
              <FiHome /> Go to my dashboard
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Unauthorized;
