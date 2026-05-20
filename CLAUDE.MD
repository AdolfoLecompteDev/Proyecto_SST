# CLAUDE.md
# Sistema Web SST y Validación de Empleados

> Este archivo es leído automáticamente por Claude Code.
> Seguir todos los lineamientos aquí definidos sin excepción.

---

## 📁 Archivos de referencia obligatoria

**Leer estos archivos ANTES de escribir cualquier código:**

| Archivo | Qué define | Cuándo aplica |
|---------|-----------|---------------|
| `RULES.md` (frontend) | Estructura de carpetas, convenciones de nombres, stack, reglas de componentes | Todo cambio en el frontend |
| `RULES.md` (backend) | Arquitectura por módulos, convenciones, seguridad, base de datos | Todo cambio en el backend |
| `DESIGN.md` | Paleta de colores, tipografía, espaciado, componentes UI | Cualquier archivo `.jsx` o de estilos |

> ⚠️ Si hay conflicto entre una instrucción del chat y `RULES.md` o `DESIGN.md`,
> **los archivos tienen prioridad**. Consultar antes de desviarse.

---

## ⚡ Cómo correr el proyecto

```bash
npm run dev       # frontend (puerto 5173)
node server.js    # backend  (puerto 3000)
```

---

## 🛠️ Comandos frecuentes

```bash
npm run lint
npm test
```

---

## 🚫 Lo que NO debes tocar

- `src/config/db.js` — pool de conexión, no modificar sin avisar
- `.env` — nunca commitear, usar `.env.example` como referencia

---

## ✅ Convenciones clave

- Toda lógica de negocio va en el **service**, no en el controller
- Toda llamada HTTP del frontend va en `src/api/`, nunca directo en componentes
- Queries **siempre parametrizadas** (`$1, $2`) — nunca interpolación de strings
- Nombres de archivos y funciones según las convenciones de `RULES.md`
- Estilos y componentes UI según los tokens definidos en `DESIGN.md`