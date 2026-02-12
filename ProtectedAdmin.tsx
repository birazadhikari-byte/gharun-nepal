import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth, isSystemRole } from "@/contexts/AuthContext";

interface Props {
  children: React.ReactNode;
}

const ProtectedAdmin: React.FC<Props> = ({ children }) => {
  const { user } = useAuth();

  // Not logged in → go home
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Logged in but not admin/system → go home
  if (!isSystemRole(user.role)) {
    return <Navigate to="/" replace />;
  }

  // Admin allowed
  return <>{children}</>;
};

export default ProtectedAdmin;