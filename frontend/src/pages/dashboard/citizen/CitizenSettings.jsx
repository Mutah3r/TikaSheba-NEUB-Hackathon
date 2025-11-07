import { motion } from "framer-motion";
import { FiSettings, FiUser } from "react-icons/fi";
import { useOutletContext } from "react-router";

const CitizenSettings = () => {
  const { user } = useOutletContext() || {};

  const formatOrdinalDate = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    const day = d.getDate();
    const suffix = (n) => {
      if (n % 10 === 1 && n % 100 !== 11) return "st";
      if (n % 10 === 2 && n % 100 !== 12) return "nd";
      if (n % 10 === 3 && n % 100 !== 13) return "rd";
      return "th";
    };
    const month = d.toLocaleString("en-GB", { month: "long" });
    const year = d.getFullYear();
    return `${day}${suffix(day)} ${month}, ${year}`;
  };

  const profile = {
    name: user?.name || "",
    gender: user?.gender || "",
    dob: formatOrdinalDate(user?.DOB),
    regNo: user?.reg_no || "",
    idType: user?.NID_or_Birth ? "NID" : "Birth Certificate",
    idNumber: user?.NID_or_Birth ? user?.NID_no : user?.Birth_Certificate_no,
    phone: user?.phone_number || "",
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="rounded-2xl bg-white/70 backdrop-blur-md shadow-sm ring-1 ring-[#081F2E]/10 p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAB308]/20 text-[#EAB308] ring-1 ring-[#EAB308]/30">
          <FiSettings />
        </div>
        <h2 className="text-xl font-semibold text-[#081F2E]">Profile Settings</h2>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-xl bg-white shadow-sm ring-1 ring-[#081F2E]/10 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#081F2E]/10 text-[#081F2E]">
              <FiUser />
            </div>
            <div className="font-medium text-[#081F2E]">Personal Info</div>
          </div>
          <div className="text-[#0c2b40]/80 text-sm">
            <div><span className="font-medium">Name:</span> {profile.name || "-"}</div>
            <div><span className="font-medium">Gender:</span> {profile.gender || "-"}</div>
            <div><span className="font-medium">Date of Birth:</span> {profile.dob || "-"}</div>
          </div>
        </div>

        <div className="rounded-xl bg-white shadow-sm ring-1 ring-[#081F2E]/10 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#081F2E]/10 text-[#081F2E]">
              <FiUser />
            </div>
            <div className="font-medium text-[#081F2E]">Identity & Contact</div>
          </div>
          <div className="text-[#0c2b40]/80 text-sm">
            <div><span className="font-medium">Registration No:</span> {profile.regNo || "-"}</div>
            <div><span className="font-medium">ID Type:</span> {profile.idType || "-"}</div>
            <div><span className="font-medium">ID Number:</span> {profile.idNumber || "-"}</div>
            <div><span className="font-medium">Phone:</span> {profile.phone || "-"}</div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-[#0c2b40]/70 text-sm">
        These are read-only placeholders. In a real implementation, you can
        allow editing and saving to your account profile.
      </div>
    </motion.section>
  );
};

export default CitizenSettings;