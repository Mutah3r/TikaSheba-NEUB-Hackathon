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
import CentreDashboard from "../pages/dashboard/CentreDashboard";
import CentreAppointments from "../pages/dashboard/centre/CentreAppointments";
import CentreStock from "../pages/dashboard/centre/CentreStock";
import CentreForecast from "../pages/dashboard/centre/CentreForecast";
import CentreStaff from "../pages/dashboard/centre/CentreStaff";
import CentreLogs from "../pages/dashboard/centre/CentreLogs";
import CentreAIInsights from "../pages/dashboard/centre/CentreAIInsights";
import AuthorityDashboard from "../pages/dashboard/AuthorityDashboard";
import AuthorityVaccines from "../pages/dashboard/authority/AuthorityVaccines";
import AuthorityCentres from "../pages/dashboard/authority/AuthorityCentres";
import AuthorityStockRequests from "../pages/dashboard/authority/AuthorityStockRequests";
import AuthorityVisualization from "../pages/dashboard/authority/AuthorityVisualization";
import AuthorityAIInsights from "../pages/dashboard/authority/AuthorityAIInsights";

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
          {
            path: "centre",
            Component: CentreOnly,
            children: [
              { index: true, Component: CentreDashboard },
              { path: "appointments", Component: CentreAppointments },
              { path: "stock", Component: CentreStock },
              { path: "forecast", Component: CentreForecast },
              { path: "staff", Component: CentreStaff },
              { path: "logs", Component: CentreLogs },
              { path: "insights", Component: CentreAIInsights },
            ],
          },
          {
            path: "authority",
            Component: AuthorityOnly,
            children: [
              { index: true, Component: AuthorityDashboard },
              { path: "vaccines", Component: AuthorityVaccines },
              { path: "centres", Component: AuthorityCentres },
              { path: "requests", Component: AuthorityStockRequests },
              { path: "visualization", Component: AuthorityVisualization },
              { path: "ai", Component: AuthorityAIInsights },
            ],
          },
          { path: "unauthorized", Component: Unauthorized },
        ],
      },
    ],
  },
]);

export default router;
