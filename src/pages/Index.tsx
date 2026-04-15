import { useAuth } from "@/lib/auth";
import { Navigate } from "react-router-dom";

export default function Index() {
  const isAuthenticated = useAuth((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to="/dashboard" replace />;
}
