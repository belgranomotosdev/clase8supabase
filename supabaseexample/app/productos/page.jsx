"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";

export default function ProductosPage() {
  const [productos, setProductos] = useState([]);
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [editingId, setEditingId] = useState(null);
  
  const supabase = createClient();

  useEffect(() => {
    cargarProductos();

    // Suscripción Realtime: recarga la lista cuando hay cambios en la tabla `productos`
    const channel = supabase
      .channel('productos-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'productos' },
        (payload) => {
          console.log('Realtime productos:', payload);
          // Para simplicidad, simplemente recargamos la lista
          cargarProductos();
        }
      )
      .subscribe();

    return () => {
      // cancelar suscripción al desmontar
      supabase.removeChannel(channel);
    };
  }, []);

  const cargarProductos = async () => {
    const { data } = await supabase.from('productos').select('*');
    setProductos(data || []);
  };

  const crear = async () => {
    await supabase.from('productos').insert({ nombre, precio: parseFloat(precio) });
    setNombre("");
    setPrecio("");
    cargarProductos();
  };

  const actualizar = async () => {
    await supabase.from('productos').update({ nombre, precio: parseFloat(precio) }).eq('id', editingId);
    setNombre("");
    setPrecio("");
    setEditingId(null);
    cargarProductos();
  };

  const editar = (producto) => {
    setNombre(producto.nombre);
    setPrecio(producto.precio);
    setEditingId(producto.id);
  };

  const eliminar = async (id) => {
    await supabase.from('productos').delete().eq('id', id);
    cargarProductos();
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Productos</h1>

      {/* Formulario */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="border p-2 rounded w-full mb-3"
        />
        <input
          type="number"
          placeholder="Precio"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          className="border p-2 rounded w-full mb-3"
        />
        <button
          onClick={editingId ? actualizar : crear}
          className="bg-blue-600 text-white px-6 py-2 rounded w-full"
        >
          {editingId ? 'Actualizar' : 'Crear'}
        </button>
        {editingId && (
          <button
            onClick={() => { setEditingId(null); setNombre(""); setPrecio(""); }}
            className="bg-gray-500 text-white px-6 py-2 rounded w-full mt-2"
          >
            Cancelar
          </button>
        )}
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {productos.map((p) => (
          <div key={p.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
            <div>
              <h3 className="font-bold">{p.nombre}</h3>
              <p className="text-gray-600">${p.precio}</p>
            </div>
            <div className="space-x-2">
              <button onClick={() => editar(p)} className="bg-yellow-500 text-white px-3 py-1 rounded">
                Editar
              </button>
              <button onClick={() => eliminar(p.id)} className="bg-red-500 text-white px-3 py-1 rounded">
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

