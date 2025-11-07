import { motion } from "framer-motion";
import { FiSettings, FiUser } from "react-icons/fi";

const CitizenSettings = () => {
  // Placeholder profile details; wire to real user data later
  const profile = {
    name: localStorage.getItem("user_name") || "Md. Rahim Uddin",
    email: localStorage.getItem("user_email") || "rahim@example.com",
    nid: localStorage.getItem("nid") || "1234 5678 9012",
    birthCert: localStorage.getItem("birth_cert") || "BC-0901-2025",
    dob: localStorage.getItem("dob") || "1998-08-15",
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
            <div><span className="font-medium">Name:</span> {profile.name}</div>
            <div><span className="font-medium">Email:</span> {profile.email}</div>
            <div><span className="font-medium">Date of Birth:</span> {profile.dob}</div>
          </div>
        </div>

        <div className="rounded-xl bg-white shadow-sm ring-1 ring-[#081F2E]/10 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#081F2E]/10 text-[#081F2E]">
              <FiUser />
            </div>
            <div className="font-medium text-[#081F2E]">Identity</div>
          </div>
          <div className="text-[#0c2b40]/80 text-sm">
            <div><span className="font-medium">NID:</span> {profile.nid}</div>
            <div><span className="font-medium">Birth Certificate:</span> {profile.birthCert}</div>
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