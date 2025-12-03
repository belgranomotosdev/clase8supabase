import axios from 'axios';
import { createClient } from './client';

/**
 * Cliente Axios configurado para REST API de Supabase
 * Incluye automáticamente el access token y headers necesarios
 */
export function createAxiosClient() {
  const supabase = createClient();
  
  const instance = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1`,
    headers: {
      'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      'Content-Type': 'application/json'
    }
  });

  // Interceptor para agregar el token automáticamente
  instance.interceptors.request.use(
    async (config) => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Interceptor para manejar errores
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        console.error('No autorizado - Token expirado o inválido');
      }
      return Promise.reject(error);
    }
  );

  return instance;
}

/**
 * Funciones helper simples para operaciones CRUD
 */

// GET - Listar registros
export async function getAll(table, filters = {}) {
  const axios = createAxiosClient();
  const params = {};
  
  // Agregar filtros (ejemplo: { categoria: 'electronica' })
  Object.entries(filters).forEach(([key, value]) => {
    params[key] = `eq.${value}`;
  });
  
  const response = await axios.get(`/${table}`, { params });
  return response.data;
}

// GET BY ID - Obtener un registro
export async function getById(table, id) {
  const axios = createAxiosClient();
  const response = await axios.get(`/${table}?id=eq.${id}`);
  return response.data[0];
}

// POST - Crear registro
export async function create(table, data) {
  const axios = createAxiosClient();
  const response = await axios.post(`/${table}`, data, {
    headers: { 'Prefer': 'return=representation' }
  });
  return response.data[0];
}

// PATCH - Actualizar registro
export async function update(table, id, data) {
  const axios = createAxiosClient();
  const response = await axios.patch(`/${table}?id=eq.${id}`, data, {
    headers: { 'Prefer': 'return=representation' }
  });
  return response.data[0];
}

// DELETE - Eliminar registro
export async function deleteRecord(table, id) {
  const axios = createAxiosClient();
  await axios.delete(`/${table}?id=eq.${id}`);
}

// Query personalizada
export async function query(table, queryString) {
  const axios = createAxiosClient();
  const response = await axios.get(`/${table}?${queryString}`);
  return response.data;
}
