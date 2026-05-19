# CLAUDE.md

## Cómo correr el proyecto
npm run dev        # frontend (puerto 5173)
node server.js     # backend (puerto 3000)

## Comandos frecuentes
npm run lint
npm test

## Lo que NO debes tocar
- src/config/db.js  (pool de conexión, no modificar sin avisar)
- .env              (nunca commitear)

## Convenciones clave
- Toda lógica de negocio va en el service, no en el controller
- Toda llamada HTTP del frontend va en src/api/, nunca directo en componentes
- Queries siempre parametrizadas ($1, $2)