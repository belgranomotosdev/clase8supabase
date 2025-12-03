"use client";

import { useState, useEffect } from "react";
import { supabaseAPI } from "../../lib/supabase/axios-client";

interface Product {
  id: number;
  nombre: string;
  precio: number;
  categoria: string;
  created_at?: string;
}

export default function AxiosExamplePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    precio: 0,
    categoria: ""
  });

  // GET - Listar productos
  async function fetchProducts() {
    try {
      setLoading(true);
      setError(null);
      
      const data = await supabaseAPI.get<Product>("productos", {
        order: "created_at.desc",
        limit: 10
      });
      
      setProducts(data);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  }

  // POST - Crear producto
  async function createProduct(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      const newProduct = await supabaseAPI.create<Product>("productos", formData);
      
      setProducts([newProduct, ...products]);
      setFormData({ nombre: "", precio: 0, categoria: "" });
      alert("Producto creado!");
    } catch (err: any) {
      setError(err.message);
      console.error("Error creating product:", err);
    } finally {
      setLoading(false);
    }
  }

  // PATCH - Actualizar producto
  async function updateProduct(id: number, updates: Partial<Product>) {
    try {
      setLoading(true);
      setError(null);
      
      const updated = await supabaseAPI.update<Product>("productos", id, updates);
      
      setProducts(products.map(p => p.id === id ? updated : p));
      alert("Producto actualizado!");
    } catch (err: any) {
      setError(err.message);
      console.error("Error updating product:", err);
    } finally {
      setLoading(false);
    }
  }

  // DELETE - Eliminar producto
  async function deleteProduct(id: number) {
    if (!confirm("¿Eliminar este producto?")) return;
    
    try {
      setLoading(true);
      setError(null);
      
      await supabaseAPI.delete("productos", id);
      
      setProducts(products.filter(p => p.id !== id));
      alert("Producto eliminado!");
    } catch (err: any) {
      setError(err.message);
      console.error("Error deleting product:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          CRUD con Axios
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Ejemplo de operaciones CRUD usando Axios y REST API
        </p>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-400">Error: {error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulario de creación */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Crear Producto
            </h2>
            
            <form onSubmit={createProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Precio
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.precio}
                  onChange={(e) => setFormData({ ...formData, precio: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Categoría
                </label>
                <select
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">Seleccionar...</option>
                  <option value="electronica">Electrónica</option>
                  <option value="ropa">Ropa</option>
                  <option value="hogar">Hogar</option>
                  <option value="deportes">Deportes</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200"
              >
                {loading ? "Creando..." : "Crear Producto"}
              </button>
            </form>
          </div>

          {/* Lista de productos */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Productos ({products.length})
              </h2>
              <button
                onClick={fetchProducts}
                disabled={loading}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg text-sm transition-colors duration-200"
              >
                Recargar
              </button>
            </div>

            {loading && products.length === 0 ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : products.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No hay productos. Crea uno para comenzar.
              </p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {product.nombre}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          ${product.precio.toFixed(2)}
                        </p>
                        <span className="inline-block mt-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-xs">
                          {product.categoria}
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const newPrice = prompt("Nuevo precio:", product.precio.toString());
                            if (newPrice) updateProduct(product.id, { precio: Number(newPrice) });
                          }}
                          className="px-2 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-sm transition-colors duration-200"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition-colors duration-200"
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

        {/* Ejemplos de código */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Ejemplos de uso
          </h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                1. Listar productos
              </h3>
              <pre className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-xs overflow-x-auto">
                <code className="text-gray-700 dark:text-gray-300">
{`import { supabaseAPI } from "@/lib/supabase/axios-client";

const products = await supabaseAPI.get("productos", {
  order: "created_at.desc",
  limit: 10
});`}
                </code>
              </pre>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                2. Crear producto
              </h3>
              <pre className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-xs overflow-x-auto">
                <code className="text-gray-700 dark:text-gray-300">
{`const newProduct = await supabaseAPI.create("productos", {
  nombre: "Laptop",
  precio: 999.99,
  categoria: "electronica"
});`}
                </code>
              </pre>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                3. Actualizar producto
              </h3>
              <pre className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-xs overflow-x-auto">
                <code className="text-gray-700 dark:text-gray-300">
{`const updated = await supabaseAPI.update("productos", 1, {
  precio: 899.99
});`}
                </code>
              </pre>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                4. Eliminar producto
              </h3>
              <pre className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-xs overflow-x-auto">
                <code className="text-gray-700 dark:text-gray-300">
{`await supabaseAPI.delete("productos", 1);`}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
