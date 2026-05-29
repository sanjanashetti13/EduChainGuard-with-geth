import React from "react";

import { AppShell } from "components/layout";
import ProfilePage from "features/profile/ProfilePage";

export default function ProfileShell() {
  return (
    <AppShell flush>
      <ProfilePage />
    </AppShell>
  );
}
