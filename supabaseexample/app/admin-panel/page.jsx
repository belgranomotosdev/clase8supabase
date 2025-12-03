"use client";

import { ProtectedRoute } from "../../components/ProtectedRoute";
import { useAuth } from "../../contexts/AuthContext";

export default function AdminPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Panel de Administración</h1>
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
          <p className="text-red-800 font-semibold mb-2">🔒 Área Restringida</p>
          <p className="text-red-600">Solo administradores pueden ver esto</p>
          <p className="mt-4 text-sm text-gray-600">Usuario actual: {user?.email}</p>
        </div>
      </div>
    </ProtectedRoute>
  );
}
