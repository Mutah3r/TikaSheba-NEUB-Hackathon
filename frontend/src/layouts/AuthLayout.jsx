import { motion } from "framer-motion";
import { useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router";
import transparentLogo from "../assets/logo-text.png";
import logo from "../assets/logo.png";

const AuthLayout = () => {
  const navigate = useNavigate();

  // If user is already authenticated, redirect away from /auth and its children
  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (!token) return;
    const role = localStorage.getItem("role") || "citizen";
    if (role === "authority") {
      navigate("/dashboard/authority", { replace: true });
    } else if (
      role === "vacc_centre" ||
      role === "vcc_centre" ||
      role === "centre"
    ) {
      navigate("/dashboard/centre", { replace: true });
    } else {
      navigate("/dashboard/citizen", { replace: true });
    }
  }, [navigate]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff7f5] via-[#fffaf0] to-[#fffef7] text-[#081F2E]">
      <header className="w-full">
        <div className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="h-10 w-10 object-contain" />
            <div className="font-semibold tracking-wide text-lg">TikaSheba</div>
          </div>
          <nav className="flex items-center gap-3">
            <Link
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium bg-[#F04E36] text-white hover:bg-[#e3452f] transition-colors"
              to="/auth/login"
            >
              Login
            </Link>
            <Link
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium bg-[#EAB308] text-[#081F2E] hover:bg-[#d4a307] transition-colors"
              to="/auth/register"
            >
              Register
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-12 min-h-[80vh] flex justify-center items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
        >
          <div className="hidden lg:flex flex-col gap-4 justify-center items-center">
            <img
              src={transparentLogo}
              alt="Logo"
              className="h-[250px] object-contain"
            />
            <p className="text-[#0c2b40]/80 leading-relaxed text-center">
              Seamless access for Citizens, Centres, and Authorities. Experience
              a modern, light and aesthetic interface powered by our secure
              flows.
            </p>
          </div>

          <div className="relative">
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 220, damping: 24 }}
              className="rounded-2xl bg-white shadow-xl ring-1 ring-[#F04E36]/10 overflow-hidden"
            >
              <div className="p-6 sm:p-8">
                <Outlet />
              </div>
            </motion.div>
            <div className="absolute -z-10 -top-6 -right-6 w-40 h-40 rounded-full bg-[#F04E36]/10 blur-xl" />
            <div className="absolute -z-10 -bottom-6 -left-6 w-40 h-40 rounded-full bg-[#EAB308]/20 blur-xl" />
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default AuthLayout;
