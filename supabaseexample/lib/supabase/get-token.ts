import { createClient } from "./server";

/**
 * Obtiene el access token del usuario autenticado (Server-Side)
 */
export async function getAccessToken() {
  const supabase = await createClient();
  
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    throw new Error("No hay sesión activa");
  }
  
  return session.access_token;
}

/**
 * Obtiene tanto el access token como el refresh token
 */
export async function getTokens() {
  const supabase = await createClient();
  
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    throw new Error("No hay sesión activa");
  }
  
  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresAt: session.expires_at,
    expiresIn: session.expires_in
  };
}
