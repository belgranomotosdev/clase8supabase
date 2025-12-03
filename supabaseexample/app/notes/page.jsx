"use client";

import { createClient } from "../../lib/supabase/client";
import { useEffect, useState } from "react";

export default function Page() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const supabase = createClient();

  
  useEffect(() => {
    getData();

    // Suscripción Realtime: recarga la lista cuando hay cambios en la tabla `notes`
    const channel = supabase
      .channel('notes-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notes' },
        (payload) => {
          console.log('Realtime notes:', payload);
          // recargar lista por simplicidad
          getData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // const getData = async () => {
  //   const { data } = await supabase.from("notes").select();
  //   setNotes(data || []);
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      alert("Debes iniciar sesión");
      return;
    }
    
    const { data, error } = await supabase.from("notes").insert([{ 
      title,
      user_id: user.id 
    }]);
    
    if (error) {
      console.error("Error completo:", error.message, error);
      alert("Error: " + error.message);
      return;
    }
    
    setTitle("");
    getData();
  };

  return (
    <div>
      <pre>{JSON.stringify(notes, null, 2)}</pre>

      <form onSubmit={handleSubmit}>
        <label>Insertar nota</label>
        <input 
          type="text" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
