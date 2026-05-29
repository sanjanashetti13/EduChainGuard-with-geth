import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { AppShell } from "components/layout";
import Dashboard from "views/admin/Dashboard.js";
import UploadPage from "features/upload/UploadPage";
import Tables from "views/admin/Tables.js";
import Settings from "views/admin/Settings.js";
import VerifyPage from "features/verify/VerifyPage";
import ProfilePage from "features/profile/ProfilePage";

export default function Admin() {
  return (
    <AppShell flush>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/tables" element={<Tables />} />
        <Route path="/maps" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </AppShell>
  );
}
