import BottomNav from "@/components/BottomNav";
import { Outlet } from "react-router";

export default function AppLaout() {
  return (
    <div className="app-shell">
      <div className="app-content">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}
