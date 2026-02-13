import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth, isSystemRole } from "@/contexts/AuthContext";

interface Props {
  children: React.ReactNode;
}

const ProtectedAdmin: React.FC<Props> = ({ children }) => {
  const { user } = useAuth();

  // Not logged in
  // 🔥 DEV MODE — allow access even if no auth yet
if (!user) {
  return <>{children}</>;
}

  // Not admin/system
  // 🔥 TEMP DEV MODE
// if (!isSystemRole(user.role)) {
//   return <Navigate to="/" replace />;
// }

  // Allowed
  return <>{children}</>;
};

export default ProtectedAdmin;