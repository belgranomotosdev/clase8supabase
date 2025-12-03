"use client";

import { ProtectedRoute } from "../../components/ProtectedRoute";
import NavBar from "../../components/NavBar";

export default function ProtectedLayout({ children }) {
  return (
    <ProtectedRoute requiredRole="user">
      <NavBar />
      <main>{children}</main>
    </ProtectedRoute>
  );
}
