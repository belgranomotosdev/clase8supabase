"use client";
import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";

export default function ProfilePage() {
  const supabase = createClient();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    role: "",
  });

  useEffect(() => {
    async function loadUser() {
      try {
        const {
          data: { user: authUser },
          error: userError,
        } = await supabase.auth.getUser();
        //datos completos de el usuario el roll se encuentra en user_metadata
        console.log("rol", authUser?.user_metadata?.role);
        // console.log(authUser?.user_metadata?.role);
        if (userError) throw userError;
        if (!authUser) {
          setError("No hay usuario autenticado");
          setLoading(false);
          return;
        }

        setUser(authUser);
        setFormData({
          full_name: authUser.user_metadata?.full_name || "",
          role: authUser.user_metadata?.role || "user",
        });
      } catch (err) {
        console.error("Error al cargar usuario:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    async function accestoken() {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      console.log("Token de acceso:", session?.access_token);
    }
    accestoken();
    loadUser();

    // Realtime: Escuchar cambios en la autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Cambio en autenticación:", event);
        if (session?.user) {
          setUser(session.user);
          setFormData({
            full_name: session.user.user_metadata?.full_name || "",
            role: session.user.user_metadata?.role || "user",
          });
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  async function handleUpdate(e) {
    e.preventDefault();
    setLoading(true);

    try {
      // Actualizar los metadatos del usuario
      const { data, error } = await supabase.auth.updateUser({
        data: {
          full_name: formData.full_name,
          role: formData.role,
        },
      });

      if (error) throw error;

      setUser(data.user);
      setEditing(false);
      alert("Perfil actualizado correctamente");
    } catch (err) {
      console.error("Error al actualizar:", err);
      alert("Error al actualizar perfil: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md">
          <h2 className="text-red-800 dark:text-red-400 font-semibold mb-2">
            Error
          </h2>
          <p className="text-red-600 dark:text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400">
          No se encontró el usuario
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Mi Perfil
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Gestiona tu información personal
        </p>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* Header con avatar */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32"></div>

          <div className="px-8 pb-8">
            <div className="relative -mt-16 mb-4">
              <div className="w-32 h-32 rounded-full bg-gray-300 dark:bg-gray-600 border-4 border-white dark:border-gray-800 flex items-center justify-center text-4xl font-bold text-white">
                {user.user_metadata?.full_name?.charAt(0)?.toUpperCase() ||
                  user.email?.charAt(0)?.toUpperCase() ||
                  "U"}
              </div>
            </div>

            {!editing ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">
                    ID de Usuario
                  </label>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-mono">
                    {user.id}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">
                    Email
                  </label>
                  <p className="text-lg text-gray-900 dark:text-white font-medium">
                    {user.email || "No especificado"}
                  </p>
                  {user.email_confirmed_at && (
                    <span className="inline-flex items-center mt-1 text-xs text-green-600 dark:text-green-400">
                      ✓ Verificado
                    </span>
                  )}
                </div>

                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">
                    Nombre completo
                  </label>
                  <p className="text-lg text-gray-900 dark:text-white font-medium">
                    {user.user_metadata?.full_name || "No especificado"}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">
                    Rol
                  </label>
                  <span className="inline-block mt-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium">
                    {user.user_metadata?.role || user.role || "user"}
                  </span>
                </div>

                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">
                    Proveedor de autenticación
                  </label>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {user.app_metadata?.provider || "email"}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">
                    Cuenta creada
                  </label>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {new Date(user.created_at).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">
                    Último inicio de sesión
                  </label>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {user.last_sign_in_at
                      ? new Date(user.last_sign_in_at).toLocaleDateString(
                          "es-ES",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                      : "No disponible"}
                  </p>
                </div>

                <button
                  onClick={() => setEditing(true)}
                  className="w-full mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  Editar perfil
                </button>
              </div>
            ) : (
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Tu nombre completo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rol
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="user">Usuario</option>
                    <option value="admin">Administrador</option>
                    <option value="moderator">Moderador</option>
                    <option value="editor">Editor</option>
                    <option value="viewer">Visualizador</option>
                  </select>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200"
                  >
                    {loading ? "Guardando..." : "Guardar cambios"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setFormData({
                        full_name: user.user_metadata?.full_name || "",
                        role: user.user_metadata?.role || "user",
                      });
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Información adicional de metadatos */}
        {user.user_metadata && Object.keys(user.user_metadata).length > 0 && (
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Metadatos del usuario
            </h3>
            <pre className="text-xs bg-gray-50 dark:bg-gray-900 p-4 rounded overflow-auto text-gray-700 dark:text-gray-300">
              {JSON.stringify(user.user_metadata, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
