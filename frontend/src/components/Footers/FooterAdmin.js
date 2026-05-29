import React from "react";

export default function FooterAdmin() {
  return (
    <footer className="block py-4">
      <div className="container mx-auto px-4">
        <hr className="mb-4 border-b-1 border-blueGray-200" />
        <div className="text-sm text-blueGray-500 font-semibold py-1 text-center md:text-left">
          © {new Date().getFullYear()} EduChainGuard
        </div>
      </div>
    </footer>
  );
}
