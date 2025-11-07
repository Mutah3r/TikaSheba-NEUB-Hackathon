import { useEffect } from "react";
import { useNavigate } from "react-router";

const RoleRedirect = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const role = localStorage.getItem("role") || "citizen";
    if (role === "vacc_centre" || role === "centre" || role === "vcc_centre")
      navigate("/dashboard/centre", { replace: true });
    else if (role === "authority") navigate("/dashboard/authority", { replace: true });
    else navigate("/dashboard/citizen", { replace: true });
  }, [navigate]);
  return null;
};

export default RoleRedirect;