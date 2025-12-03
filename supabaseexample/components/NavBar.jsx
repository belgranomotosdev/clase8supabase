"use client";

// import { useAuth } from "../../contexts/AuthContext";
import { useAuth } from "../contexts/AuthContext";

export default function NavBar() {
  const { user, role, isAuthenticated, signOut } = useAuth();

  return (
    <nav className="bg-white shadow-md px-6 py-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex gap-4">
          <a href="/" className="text-gray-700 hover:text-blue-600">Inicio</a>
          
          {isAuthenticated && (
            <>
              <a href="/dashboard" className="text-gray-700 hover:text-blue-600">Dashboard</a>
              <a href="/profile" className="text-gray-700 hover:text-blue-600">Perfil</a>
              
              {role === "admin" && (
                <a href="/admin-panel" className="text-red-600 hover:text-red-700 font-semibold">
                  Admin
                </a>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-gray-600">{user?.email}</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">{role}</span>
              <button
                onClick={signOut}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <a
              href="/auth/login"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
            >
              Iniciar sesión
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}
