# Leticia Murguía · Constelaciones (demo)

React + Tailwind (frontend) · Express (API de reservas) · Docker.

## Arranque
1. `cp .env.example .env` y edita usuario, contraseña y `TOKEN_SECRET`.
2. `docker compose up dev` → http://localhost:5173 (hot reload)
   o `docker compose up prod` → http://localhost:8080
3. Panel de administrador: `/admin` (usuario y contraseña del `.env`).

## Sin Docker
```bash
cd server && npm install && set -a && . ../.env && set +a && node index.js   # API en :3001
cd .. && npm install && npm run dev                                          # web en :5173
```

Las reservas se guardan en `bookings.json` (volumen `data`). Es un demo: para producción real conviene una base de datos y HTTPS.
