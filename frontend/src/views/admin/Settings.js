import React from "react";

// components

import CardSettings from "components/Cards/CardSettings.js";

export default function Settings() {
  return (
    <>
      <div className="flex flex-col items-center px-4 py-8 bg-blueGray-50 min-h-screen">
  <div className="w-full lg:w-10/12">
    <CardSettings />
  </div>
</div>

    </>
  );
}
