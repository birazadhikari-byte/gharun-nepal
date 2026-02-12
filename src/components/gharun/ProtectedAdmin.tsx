import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth, isSystemRole } from "@/contexts/AuthContext";

interface Props {
  children: React.ReactNode;
}

const ProtectedAdmin: React.FC<Props> = ({ children }) => {
  const { user } = useAuth();

  // Not logged in
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Not admin/system
  if (!isSystemRole(user.role)) {
    return <Navigate to="/" replace />;
  }

  // Allowed
  return <>{children}</>;
};

export default ProtectedAdmin;