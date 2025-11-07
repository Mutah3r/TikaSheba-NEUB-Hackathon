import { FiUser, FiShield } from "react-icons/fi";

const Dashboard = () => {
  const role = localStorage.getItem("role") || "citizen";

  return (
    <div className="min-h-[60vh] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-[#0c2b40]/70">Minimal overview for your account</p>
        </div>

        <div className="grid gap-4">
          <div className="rounded-xl bg-white shadow ring-1 ring-[#F04E36]/10 p-5 flex items-center gap-4">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAB308]/10 text-[#EAB308]">
              {role === "authority" ? <FiShield /> : <FiUser />}
            </div>
            <div>
              <p className="text-sm text-[#0c2b40]/70">You are logged in as</p>
              <p className="text-lg font-semibold capitalize">{role}</p>
            </div>
          </div>

          <div className="rounded-xl bg-white shadow ring-1 ring-[#081F2E]/10 p-5">
            <p className="text-sm text-[#0c2b40]/80">
              Welcome! This minimal dashboard will be expanded with your recent activity,
              notifications, and quick actions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;