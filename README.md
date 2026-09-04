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

## Cuentos de los tíos

La sección **Cuentos** espera las grabaciones de la familia. Cuando llegue un audio:

1. Déjalo en `public/audio/cuentos/` (`mp3`, `m4a`, `ogg` o `wav`).
2. En `src/stories.ts`, pon el nombre del archivo en `audio` y quién lo cuenta en `teller`.

Hasta que haya audio, el cuento se muestra como **Pronto**.

## Vercel

El juego se publica en `https://benjamin.frontbook.cl/juegos/` (el quiz de cumpleaños sigue en `https://benjamin.frontbook.cl/`). También queda en `https://juegosbenjamin.vercel.app/juegos/`.

El proxy del dominio está en `gateway/`. No redespliega el quiz: solo reescribe `/juegos` hacia este proyecto y el resto hacia `cumpleanos-benjamin`.

Agrega `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` en el proyecto `juegosbenjamin` si quieres leer el contenido remoto.
