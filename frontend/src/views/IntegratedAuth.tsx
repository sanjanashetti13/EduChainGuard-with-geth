import React from "react";

import AuthPage from "views/AuthPage";

type Tab = "signin" | "signup";

type Props = {
  initialTab?: Tab;
};

/** Route wrapper → unified auth UI (manual + Google). */
export default function IntegratedAuth({
  initialTab = "signin",
}: Props) {
  return (
    <AuthPage
      initialMode={initialTab === "signin" ? "login" : "signup"}
    />
  );
}
