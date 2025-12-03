"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import Image from "next/image";

export default function SupabaseFilesPage() {
  const [files, setFiles] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const bucket = "images"; // Cambia este nombre por tu bucket real
  const supabase = createClient();

  // ======================================================
  // LISTAR ARCHIVOS DEL BUCKET
  // ======================================================
  async function fetchFiles() {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list("", { limit: 100 });

    if (error) {
      console.error("Error al listar archivos:", error);
      alert("Error al listar archivos. Verifica que el bucket existe y es público.");
    } else {
      setFiles(data || []);
    }
  }

  // ======================================================
  // SUBIR ARCHIVO
  // ======================================================
  async function uploadFile() {
    if (!file) return alert("Selecciona un archivo");

    setLoading(true);
    const fileName = `${Date.now()}-${file.name}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false
      });

    setLoading(false);

    if (error) {
      alert("Error al subir archivo: " + error.message);
      console.log(error);
      return;
    }

    alert("Archivo subido!");
    setFile(null);
    fetchFiles();
  }

  // ======================================================
  // OBTENER URL PÚBLICA
  // ======================================================
  function getPublicUrl(path) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  // ======================================================
  // ELIMINAR ARCHIVO
  // ======================================================
  async function deleteFile(path) {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) {
      alert("Error al eliminar");
      console.log(error);
      return;
    }

    alert("Archivo eliminado");
    fetchFiles();
  }

  // ======================================================
  // REALTIME: ESCUCHAR CAMBIOS EN STORAGE
  // ======================================================
  useEffect(() => {
    fetchFiles();

    // Crear canal para escuchar cambios en el bucket de storage
    const channel = supabase
      .channel("storage-bucket-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "storage",
          table: "objects",
          filter: `bucket_id=eq.${bucket}`
        },
        (payload) => {
          console.log("Cambio detectado en storage:", payload);
          fetchFiles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Gestión de archivos con Supabase
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Storage + Realtime
        </p>

        {/* ======================= SUBIR ARCHIVO ========================== */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Subir nuevo archivo
          </h2>
          <div className="flex items-center gap-4">
            <input 
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])}
              disabled={loading}
              className="flex-1 text-sm text-gray-900 dark:text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button 
              onClick={uploadFile} 
              disabled={loading || !file}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200 shadow-md"
            >
              {loading ? "Subiendo..." : "Subir archivo"}
            </button>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Archivos del bucket "{bucket}"
        </h2>

        {files.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <p className="mt-4 text-gray-500 dark:text-gray-400 text-lg">
              No hay archivos en el bucket
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {files.map((f) => (
              <div 
                key={f.name} 
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative w-full h-64 bg-gray-100 dark:bg-gray-700">
                  <Image
                    src={getPublicUrl(f.name)}
                    alt={f.name}
                    fill
                    className="object-contain"
                    onError={(e) => {
                      console.error("Error al cargar imagen:", f.name);
                      console.error("URL:", getPublicUrl(f.name));
                    }}
                    onLoad={() => {
                      console.log("Imagen cargada correctamente:", f.name);
                    }}
                    unoptimized
                  />
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate mb-1">
                    {f.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    {(f.metadata?.size / 1024).toFixed(2)} KB
                  </p>
                  
                  <div className="flex gap-2">
                    <a
                      href={getPublicUrl(f.name)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 text-center px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors duration-200 text-sm font-medium"
                    >
                      Ver
                    </a>
                    <button
                      onClick={() => deleteFile(f.name)}
                      className="flex-1 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors duration-200 text-sm font-medium"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
