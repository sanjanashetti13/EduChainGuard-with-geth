import React from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "hooks/useAuth";
import type { UserRole } from "lib/api/types";

type RequireAuthProps = {
  children: React.ReactNode;
  /** If set, user must have one of these roles */
  roles?: UserRole[];
};

export default function RequireAuth({ children, roles }: RequireAuthProps) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (roles?.length && user?.role && !roles.includes(user.role as UserRole)) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
}
