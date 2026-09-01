# Juegos de Benjamín

Juego web táctil de letras, números y memorice para un niño de 2 años.

## Desarrollo

```bash
npm install
cp .env.example .env.local
npm run dev
```

La app funciona con contenido local sin variables. Para leer desde el proyecto Supabase `zlmewvuycqwevfeqwylb`, ejecuta `supabase/setup.sql` en su SQL Editor y configura la clave **Publishable** en `.env.local` y Vercel. Nunca uses una clave Secret o `service_role` en variables `VITE_*`.

Las pronunciaciones en español e inglés están incluidas en `public/audio`, para que el juego no dependa de las voces instaladas en el dispositivo. Se pueden regenerar en macOS con `npm run generate:audio`.

## Vercel

Importa este repositorio en Vercel y agrega `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`. La compilación ya está configurada en `vercel.json`.
