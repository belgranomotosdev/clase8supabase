"use client";

import { ProtectedRoute } from "../../components/ProtectedRoute";

export default function AdminLayout({ children }) {
  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-red-50">
        <div className="bg-red-600 text-white p-4">
          <h2 className="text-xl font-bold">🔒 Panel de Administración</h2>
        </div>
        <main className="p-8">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
