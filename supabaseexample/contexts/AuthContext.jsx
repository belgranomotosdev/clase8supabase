"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "../lib/supabase/client";
import { useRouter } from "next/navigation";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    // Cargar usuario inicial
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setRole(user?.user_metadata?.role || "user");
      setLoading(false);
    });

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
        setRole(session?.user?.user_metadata?.role || "user");
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const hasRole = (requiredRole) => {
    const roles = {
      viewer: 1,
      user: 2,
      editor: 3,
      moderator: 4,
      admin: 5
    };
    return roles[role] >= roles[requiredRole];
  };

  const value = {
    user,
    role,
    loading,
    signOut,
    hasRole,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}
