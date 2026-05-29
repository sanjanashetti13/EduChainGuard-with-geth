import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { AuthLayout } from "components/layout";
import LoginPage from "features/auth/LoginPage";
import RegisterPage from "features/auth/RegisterPage";

export default function Auth() {
  return (
    <AuthLayout>
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/auth/login" replace />} />
      </Routes>
    </AuthLayout>
  );
}
