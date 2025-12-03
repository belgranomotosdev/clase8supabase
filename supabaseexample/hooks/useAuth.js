// hooks/useAuth.js
import { useEffect, useState } from "react";
import { createClient } from "../lib/supabase/client";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("user");
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setRole(user?.user_metadata?.role);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
        setRole(session?.user?.user_metadata?.role || "user");
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { user, role };
}