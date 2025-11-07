import { Outlet, Navigate, useLocation } from "react-router";

function PrivateRoute() {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  const location = useLocation();

  if (!token) {
    return <Navigate to="/auth/login" replace state={{ from: location?.pathname || "/" }} />;
  }

  return <Outlet />;
}

export default PrivateRoute;