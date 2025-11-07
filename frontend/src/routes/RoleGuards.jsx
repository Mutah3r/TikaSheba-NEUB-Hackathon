import { Navigate, Outlet } from "react-router";
import AuthorityDashboard from "../pages/dashboard/AuthorityDashboard";
import CentreDashboard from "../pages/dashboard/CentreDashboard";

function roleMatches(required) {
  const role =
    typeof window !== "undefined" ? localStorage.getItem("role") : null;
  if (required === "vacc_centre") {
    return (
      role === "vacc_centre" || role === "vcc_centre" || role === "centre"
    ); // support previous values
  }
  return role === required;
}

export function CitizenOnly() {
  if (!roleMatches("citizen")) {
    return (
      <Navigate
        to="/dashboard/unauthorized"
        replace
        state={{ required: "citizen" }}
      />
    );
  }
  // Render nested citizen routes (dashboard home as index, plus tabs)
  return <Outlet />;
}

export function CentreOnly() {
  if (!roleMatches("vacc_centre")) {
    return (
      <Navigate
        to="/dashboard/unauthorized"
        replace
        state={{ required: "vacc_centre" }}
      />
    );
  }
  return <CentreDashboard />;
}

export function AuthorityOnly() {
  if (!roleMatches("authority")) {
    return (
      <Navigate
        to="/dashboard/unauthorized"
        replace
        state={{ required: "authority" }}
      />
    );
  }
  return <AuthorityDashboard />;
}
