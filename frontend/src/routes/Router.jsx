import { createBrowserRouter } from "react-router";
import AuthLayout from "../layouts/AuthLayout";
import MainLayout from "../layouts/MainLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import Home from "../pages/Home";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import RoleRedirect from "../pages/dashboard/RoleRedirect";
import PrivateRoute from "./PrivateRoute";
import Unauthorized from "../pages/errors/Unauthorized";
import { CitizenOnly, CentreOnly, AuthorityOnly } from "./RoleGuards";
import CitizenDashboard from "../pages/dashboard/CitizenDashboard";
import CitizenSchedule from "../pages/dashboard/citizen/CitizenSchedule";
import CitizenAppointments from "../pages/dashboard/citizen/CitizenAppointments";
import CitizenLogs from "../pages/dashboard/citizen/CitizenLogs";
import CitizenAIGuidance from "../pages/dashboard/citizen/CitizenAIGuidance";
import CitizenSettings from "../pages/dashboard/citizen/CitizenSettings";

const router = createBrowserRouter([
  {
    path: "/",
    Component: MainLayout,
    children: [{ index: true, Component: Home }],
  },
  {
    path: "auth",
    Component: AuthLayout,
    children: [
      { path: "login", Component: Login },
      { path: "register", Component: Register },
    ],
  },
  {
    path: "dashboard",
    Component: PrivateRoute,
    children: [
      {
        Component: DashboardLayout,
        children: [
          { index: true, Component: RoleRedirect },
          {
            path: "citizen",
            Component: CitizenOnly,
            children: [
              { index: true, Component: CitizenDashboard },
              { path: "schedule", Component: CitizenSchedule },
              { path: "appointments", Component: CitizenAppointments },
              { path: "logs", Component: CitizenLogs },
              { path: "ai", Component: CitizenAIGuidance },
              { path: "settings", Component: CitizenSettings },
            ],
          },
          { path: "centre", Component: CentreOnly },
          { path: "authority", Component: AuthorityOnly },
          { path: "unauthorized", Component: Unauthorized },
        ],
      },
    ],
  },
]);

export default router;
