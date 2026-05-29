import React from "react";
import { Navigate } from "react-router-dom";

import IntegratedAuth from "views/IntegratedAuth";
import { dashboardPathForRole } from "utils/routeForRole";

export default function WelcomeGate() {
  const raw = localStorage.getItem("user");
  if (raw) {
    try {
      const user = JSON.parse(raw) as { role?: string };
      if (user?.role)
        return <Navigate to={dashboardPathForRole(user.role)} replace />;
    } catch {
      localStorage.removeItem("user");
    }
  }

  return <IntegratedAuth initialTab="signin" />;
}
