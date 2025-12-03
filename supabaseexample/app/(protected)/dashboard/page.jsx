"use client";

import { useAuth } from "../../../contexts/AuthContext";

export default function DashboardPage() {
  const { user, role } = useAuth();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p>Usuario: {user?.email}</p>
      <p>Rol: {role}</p>
    </div>
  );
}
