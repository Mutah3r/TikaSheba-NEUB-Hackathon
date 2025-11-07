import { Outlet } from "react-router";

const MainLayout = () => {
  return (
    <div>
      <h1>This is main layout</h1>

      <Outlet />
    </div>
  );
};

export default MainLayout;
