import { Navigate, Outlet } from "react-router";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute() {
  const { session, loading } = useAuth();

  if (loading) return <p>loading</p>;
  if (!session) return <Navigate to="/login" replace />;

  return <Outlet />;
}
