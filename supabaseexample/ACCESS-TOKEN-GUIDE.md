# 🔑 Obtener Access Token de Supabase

## 📍 En el Cliente (Browser)

### Método 1: Con el SDK de Supabase

```typescript
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();
const { data: { session } } = await supabase.auth.getSession();
const accessToken = session?.access_token;
```

### Método 2: Directamente con fetch

```typescript
const { data: { session } } = await supabase.auth.getSession();

fetch('https://tu-proyecto.supabase.co/rest/v1/tu_tabla', {
  headers: {
    'apikey': 'TU_ANON_KEY',
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => console.log(data));
```

## 🖥️ En el Servidor (Server Components / API Routes)

```typescript
import { getAccessToken } from "@/lib/supabase/get-token";

// En Server Component o API Route
const token = await getAccessToken();

// Usar con REST API
const response = await fetch('https://tu-proyecto.supabase.co/rest/v1/tu_tabla', {
  headers: {
    'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## 🔄 Operaciones CRUD con REST API

### GET - Listar registros

```typescript
const { data: { session } } = await supabase.auth.getSession();

fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/productos`, {
  headers: {
    'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    'Authorization': `Bearer ${session.access_token}`
  }
})
.then(res => res.json())
.then(data => console.log(data));
```

### GET con filtros

```typescript
// Filtrar por columna
fetch(`${SUPABASE_URL}/rest/v1/productos?categoria=eq.electronica`, {
  headers: { ... }
})

// Múltiples filtros
fetch(`${SUPABASE_URL}/rest/v1/productos?precio=gte.100&categoria=eq.ropa`, {
  headers: { ... }
})

// Ordenar y limitar
fetch(`${SUPABASE_URL}/rest/v1/productos?order=precio.desc&limit=10`, {
  headers: { ... }
})
```

### POST - Crear registro

```typescript
fetch(`${SUPABASE_URL}/rest/v1/productos`, {
  method: 'POST',
  headers: {
    'apikey': ANON_KEY,
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation' // Devuelve el registro creado
  },
  body: JSON.stringify({
    nombre: 'Producto Nuevo',
    precio: 99.99,
    categoria: 'electronica'
  })
})
.then(res => res.json())
.then(data => console.log('Creado:', data));
```

### PATCH - Actualizar registro

```typescript
fetch(`${SUPABASE_URL}/rest/v1/productos?id=eq.123`, {
  method: 'PATCH',
  headers: {
    'apikey': ANON_KEY,
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  },
  body: JSON.stringify({
    precio: 89.99
  })
})
.then(res => res.json())
.then(data => console.log('Actualizado:', data));
```

### DELETE - Eliminar registro

```typescript
fetch(`${SUPABASE_URL}/rest/v1/productos?id=eq.123`, {
  method: 'DELETE',
  headers: {
    'apikey': ANON_KEY,
    'Authorization': `Bearer ${accessToken}`
  }
})
.then(res => {
  if (res.ok) console.log('Eliminado correctamente');
});
```

## 🎯 Página de Tokens

Visita `/tokens` para ver tu access token actual y ejemplos de uso en tiempo real.

## 📝 Headers obligatorios

```typescript
{
  'apikey': 'tu_anon_key',              // Siempre requerido
  'Authorization': 'Bearer ACCESS_TOKEN', // Para autenticación
  'Content-Type': 'application/json'      // Para POST/PATCH
}
```

## ⚙️ Headers opcionales

```typescript
{
  'Prefer': 'return=representation',     // Devuelve el registro creado/actualizado
  'Prefer': 'return=minimal',            // No devuelve datos (más rápido)
  'Prefer': 'resolution=merge-duplicates' // Merge en lugar de error si existe
}
```

## 🔍 Operadores de filtrado

```
eq   - Igual (=)
neq  - No igual (!=)
gt   - Mayor que (>)
gte  - Mayor o igual (>=)
lt   - Menor que (<)
lte  - Menor o igual (<=)
like - LIKE (búsqueda de patrones)
ilike - LIKE case-insensitive
in   - IN (lista de valores)
is   - IS (null/true/false)
```

### Ejemplos de filtros:

```typescript
// Igual
?nombre=eq.Juan

// Mayor o igual
?edad=gte.18

// Búsqueda
?email=ilike.*@gmail.com

// IN (lista)
?categoria=in.(ropa,electronica,hogar)

// IS NULL
?deleted_at=is.null

// Múltiples condiciones (AND)
?edad=gte.18&ciudad=eq.Madrid
```

## ⏰ Expiración del Token

- **Duración**: 1 hora (3600 segundos)
- **Renovación**: Automática con el SDK de Supabase
- **Manual**: Usa el refresh token

```typescript
const { data, error } = await supabase.auth.refreshSession();
const newAccessToken = data.session?.access_token;
```

## 🛡️ Seguridad

1. **Nunca expongas** el access token en URLs o logs públicos
2. **Usa HTTPS** siempre en producción
3. **Configura RLS** (Row Level Security) en tus tablas
4. **Valida permisos** en el servidor, no solo en el cliente

## 📊 Ver tokens en la base de datos

Los tokens se generan dinámicamente, pero puedes ver sesiones activas:

```sql
SELECT * FROM auth.sessions;
```

## 🔗 Recursos

- REST API Docs: https://supabase.com/docs/guides/api
- Filtros: https://postgrest.org/en/stable/api.html
- RLS: https://supabase.com/docs/guides/auth/row-level-security
