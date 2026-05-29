import React from "react";

import { AppShell } from "components/layout";
import IpfsUploadPage from "views/IpfsUploadPage";

export default function IpfsUploadLayout() {
  return (
    <AppShell flush>
      <IpfsUploadPage />
    </AppShell>
  );
}
