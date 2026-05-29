import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import RequireAuth from "components/auth/RequireAuth";
import Admin from "layouts/Admin";
import Auth from "layouts/Auth";
import IpfsUploadLayout from "layouts/IpfsUploadLayout";
import ProfileShell from "layouts/ProfileShell";

import Index from "views/Index";

/**
 * Top-level routes (wrapped by AppProviders + BrowserRouter in index.js).
 */
export default function App() {
  return (
    <Routes>
      <Route
        path="/admin/*"
        element={
          <RequireAuth>
            <Admin />
          </RequireAuth>
        }
      />
      <Route
        path="/upload-ipfs"
        element={
          <RequireAuth>
            <IpfsUploadLayout />
          </RequireAuth>
        }
      />
      <Route path="/auth/*" element={<Auth />} />
      <Route path="/landing" element={<Navigate to="/" replace />} />
      <Route
        path="/profile"
        element={
          <RequireAuth>
            <ProfileShell />
          </RequireAuth>
        }
      />
      <Route path="/" element={<Index />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
