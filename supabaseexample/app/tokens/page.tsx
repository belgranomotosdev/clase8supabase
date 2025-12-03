"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";

export default function TokenPage() {
  const [tokens, setTokens] = useState<{
    accessToken: string;
    refreshToken: string;
    expiresAt: number | undefined;
    expiresIn: number | undefined;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function loadTokens() {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error || !session) {
          setLoading(false);
          return;
        }

        setTokens({
          accessToken: session.access_token,
          refreshToken: session.refresh_token || "",
          expiresAt: session.expires_at,
          expiresIn: session.expires_in,
        });
      } catch (err) {
        console.error("Error obteniendo tokens:", err);
      } finally {
        setLoading(false);
      }
    }

    loadTokens();

    // Actualizar tokens cuando cambien
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setTokens({
          accessToken: session.access_token,
          refreshToken: session.refresh_token || "",
          expiresAt: session.expires_at,
          expiresIn: session.expires_in,
        });
      } else {
        setTokens(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getExpirationTime = () => {
    if (!tokens?.expiresAt) return "N/A";
    const date = new Date(tokens.expiresAt * 1000);
    return date.toLocaleString("es-ES");
  };

  const getTimeRemaining = () => {
    if (!tokens?.expiresAt) return "N/A";
    const now = Math.floor(Date.now() / 1000);
    const remaining = tokens.expiresAt - now;
    const minutes = Math.floor(remaining / 60);
    return `${minutes} minutos`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando tokens...</p>
        </div>
      </div>
    );
  }

  if (!tokens) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 max-w-md">
          <h2 className="text-yellow-800 dark:text-yellow-400 font-semibold mb-2">
            No autenticado
          </h2>
          <p className="text-yellow-600 dark:text-yellow-300 mb-4">
            Debes iniciar sesión para obtener los tokens de acceso
          </p>
          <a
            href="/auth/login"
            className="block w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-center rounded-lg"
          >
            Iniciar sesión
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Access Tokens
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Tokens de autenticación para REST API
        </p>

        {/* Access Token */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Access Token
            </h2>
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm font-medium">
              Activo
            </span>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4">
            <code className="text-xs text-gray-700 dark:text-gray-300 break-all">
              {tokens.accessToken}
            </code>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400">
                Expira en
              </label>
              <p className="text-gray-900 dark:text-white font-medium">
                {getTimeRemaining()}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400">
                Fecha de expiración
              </label>
              <p className="text-gray-900 dark:text-white font-medium">
                {getExpirationTime()}
              </p>
            </div>
          </div>

          <button
            onClick={() => copyToken(tokens.accessToken)}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
          >
            {copied ? "✓ Copiado!" : "Copiar Access Token"}
          </button>
        </div>

        {/* Ejemplos de uso */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Ejemplos de uso con REST API
          </h2>

          <div className="space-y-4">
            {/* GET Example */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                1. GET - Obtener datos
              </h3>
              <pre className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-xs overflow-x-auto">
                <code className="text-gray-700 dark:text-gray-300">
                  {`fetch('${
                    process.env.NEXT_PUBLIC_SUPABASE_URL
                  }/rest/v1/tu_tabla', {
  headers: {
    'apikey': '${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}',
    'Authorization': 'Bearer ${tokens.accessToken.substring(0, 20)}...',
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => console.log(data));`}
                </code>
              </pre>
            </div>

            {/* POST Example */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                2. POST - Crear registro
              </h3>
              <pre className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-xs overflow-x-auto">
                <code className="text-gray-700 dark:text-gray-300">
                  {`fetch('${
                    process.env.NEXT_PUBLIC_SUPABASE_URL
                  }/rest/v1/tu_tabla', {
  method: 'POST',
  headers: {
    'apikey': '${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}',
    'Authorization': 'Bearer ${tokens.accessToken.substring(0, 20)}...',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  },
  body: JSON.stringify({
    nombre: 'Ejemplo',
    descripcion: 'Dato de prueba'
  })
})
.then(res => res.json())
.then(data => console.log(data));`}
                </code>
              </pre>
            </div>

            {/* PATCH Example */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                3. PATCH - Actualizar registro
              </h3>
              <pre className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-xs overflow-x-auto">
                <code className="text-gray-700 dark:text-gray-300">
                  {`fetch('${
                    process.env.NEXT_PUBLIC_SUPABASE_URL
                  }/rest/v1/tu_tabla?id=eq.1', {
  method: 'PATCH',
  headers: {
    'apikey': '${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}',
    'Authorization': 'Bearer ${tokens.accessToken.substring(0, 20)}...',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  },
  body: JSON.stringify({
    nombre: 'Actualizado'
  })
})
.then(res => res.json())
.then(data => console.log(data));`}
                </code>
              </pre>
            </div>

            {/* DELETE Example */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                4. DELETE - Eliminar registro
              </h3>
              <pre className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-xs overflow-x-auto">
                <code className="text-gray-700 dark:text-gray-300">
                  {`fetch('${
                    process.env.NEXT_PUBLIC_SUPABASE_URL
                  }/rest/v1/tu_tabla?id=eq.1', {
  method: 'DELETE',
  headers: {
    'apikey': '${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}',
    'Authorization': 'Bearer ${tokens.accessToken.substring(0, 20)}...'
  }
})
.then(res => console.log('Eliminado'));`}
                </code>
              </pre>
            </div>
          </div>
        </div>

        {/* Notas importantes */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-3">
            📝 Notas importantes
          </h3>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
            <li>• El token expira cada hora (3600 segundos)</li>
            <li>
              • Incluye siempre el header{" "}
              <code className="bg-blue-100 dark:bg-blue-900/50 px-1 rounded">
                Authorization: Bearer TOKEN
              </code>
            </li>
            <li>
              • Usa{" "}
              <code className="bg-blue-100 dark:bg-blue-900/50 px-1 rounded">
                Prefer: return=representation
              </code>{" "}
              para recibir el registro creado/actualizado
            </li>
            <li>
              • Los filtros se agregan en la URL:{" "}
              <code className="bg-blue-100 dark:bg-blue-900/50 px-1 rounded">
                ?columna=eq.valor
              </code>
            </li>
            <li>• Respeta las políticas RLS configuradas en Supabase</li>
          </ul>
        </div>

        {/* Refresh Token Info */}
        {tokens.refreshToken && (
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Refresh Token
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Usa este token para renovar el access token cuando expire
            </p>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4">
              <code className="text-xs text-gray-700 dark:text-gray-300 break-all">
                {tokens.refreshToken}
              </code>
            </div>
            <button
              onClick={() => copyToken(tokens.refreshToken)}
              className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
            >
              Copiar Refresh Token
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
