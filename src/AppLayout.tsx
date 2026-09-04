import BottomNav from "@/components/BottomNav";
import { Outlet } from "react-router";

export default function AppLaout() {
  return (
    <>
      <Outlet />
      <BottomNav />
    </>
  );
}
