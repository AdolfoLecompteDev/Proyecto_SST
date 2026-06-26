# Sistema de Gestión SST — Documentación Técnica

> Plataforma web para gestión de Seguridad y Salud en el Trabajo (SST) en Colombia.  
> Permite administrar capacitaciones, evaluaciones, certificados y seguimiento de funcionarios.

---

## Tabla de Contenidos

1. [Stack Tecnológico](#1-stack-tecnológico)
2. [Arquitectura General](#2-arquitectura-general)
3. [Estructura de Carpetas](#3-estructura-de-carpetas)
4. [Base de Datos](#4-base-de-datos)
5. [API REST — Endpoints](#5-api-rest--endpoints)
6. [Autenticación y Autorización](#6-autenticación-y-autorización)
7. [Módulos del Frontend](#7-módulos-del-frontend)
8. [Variables de Entorno](#8-variables-de-entorno)
9. [Cómo correr el proyecto](#9-cómo-correr-el-proyecto)
10. [Roles y Permisos](#10-roles-y-permisos)
11. [Flujos Principales](#11-flujos-principales)

---

## 1. Stack Tecnológico

### Backend
| Tecnología | Versión | Uso |
|---|---|---|
| Node.js | 18+ | Runtime |
| Express | 4.21 | Framework HTTP |
| PostgreSQL | 15+ | Base de datos |
| `pg` | 8.13 | Driver PostgreSQL |
| `jsonwebtoken` | 9.0 | Autenticación JWT |
| `bcryptjs` | 2.4 | Hash de contraseñas |
| `nodemailer` | 6.9 | Envío de correos |
| `pdfkit` | 0.19 | Generación de PDF |
| `multer` | 1.4 | Subida de archivos |
| `cors` | 2.8 | Política CORS |
| `dotenv` | 16.4 | Variables de entorno |

### Frontend
| Tecnología | Versión | Uso |
|---|---|---|
| React | 19.2 | UI Framework |
| React Router | 7.15 | Enrutamiento SPA |
| Vite | 8.0 | Bundler / Dev server |
| TailwindCSS | 3.4 | Estilos utilitarios |
| Axios | 1.16 | Cliente HTTP |

### Infraestructura
| Servicio | Uso |
|---|---|
| Neon (PostgreSQL serverless) | Base de datos en producción |
| Render | Deploy del backend (recomendado) |
| Vercel | Deploy del frontend (recomendado) |

---

## 2. Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTE                              │
│          React 19 + Vite + TailwindCSS                      │
│          Puerto: 5173 (dev) / Vercel (prod)                 │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTPS / Axios (JWT en header)
┌───────────────────────▼─────────────────────────────────────┐
│                      BACKEND                                │
│          Node.js + Express  —  Puerto: 3000                 │
│                                                             │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐  │
│  │  auth   │ │capacit.  │ │evalucns  │ │  certificados │  │
│  ├─────────┤ ├──────────┤ ├──────────┤ ├───────────────┤  │
│  │usuarios │ │seguimto  │ │dashboard │ │ notificaciones│  │
│  ├─────────┤ ├──────────┤ ├──────────┤ ├───────────────┤  │
│  │auditoria│ │  config  │ │          │ │               │  │
│  └─────────┘ └──────────┘ └──────────┘ └───────────────┘  │
│                                                             │
│  Middlewares: auth.middleware → role.middleware → handler   │
└───────────────────────┬─────────────────────────────────────┘
                        │ pg Pool (SSL)
┌───────────────────────▼─────────────────────────────────────┐
│                  PostgreSQL — schema: sst                   │
│                  Neon (cloud) / local                       │
└─────────────────────────────────────────────────────────────┘
```

**Patrón por módulo**: cada módulo tiene `service.js` (queries SQL) → `controller.js` (manejo HTTP) → `routes.js` (definición de rutas).

---

## 3. Estructura de Carpetas

```
SST/
├── schema.sql                    # DDL completo de la base de datos
├── PENDIENTES.md                 # Backlog de funcionalidades
├── DOCUMENTACION.md              # Este archivo
│
├── backend/
│   ├── server.js                 # Entry point: arranca Express en puerto 3000
│   ├── .env                      # Variables de entorno (no versionar)
│   ├── package.json
│   └── src/
│       ├── app.js                # Configuración Express: CORS, rutas, error handler
│       ├── config/
│       │   ├── db.js             # Pool de conexión PostgreSQL (Neon o local)
│       │   ├── mailer.js         # Transporter Nodemailer
│       │   ├── multer.js         # Configuración subida de archivos
│       │   └── seed.js           # Script de datos iniciales
│       ├── middlewares/
│       │   ├── auth.middleware.js     # Verifica JWT en header Authorization
│       │   ├── role.middleware.js     # Verifica rol del usuario (RBAC)
│       │   ├── error.middleware.js    # Manejo centralizado de errores
│       │   ├── upload.middleware.js   # Wrapper multer para rutas
│       │   └── validate.middleware.js # Validación de body
│       ├── modules/
│       │   ├── auth/             # Login, JWT, recuperación contraseña, perfil
│       │   ├── usuarios/         # CRUD usuarios, stats por rol
│       │   ├── capacitaciones/   # CRUD capacitaciones, recursos, progreso
│       │   ├── evaluaciones/     # CRUD evaluaciones, preguntas, intentos, submit
│       │   ├── certificados/     # Consulta, verificación, descarga PDF
│       │   ├── seguimiento/      # Reporte de progreso por funcionario (vista materializada)
│       │   ├── dashboard/        # Stats globales, funcionarios sin certificar
│       │   ├── notificaciones/   # Notificaciones en tiempo real para el usuario
│       │   ├── auditoria/        # Log de acciones (tabla lista, sin implementar)
│       │   └── config/           # Config por usuario y config global del sistema
│       └── utils/
│           ├── jwt.js            # signToken / verifyToken
│           ├── password.js       # hashPassword / comparePassword (bcrypt)
│           ├── response.js       # Helpers ok() / created() / fail()
│           ├── pdf.js            # Utilidades PDF
│           └── constants.js      # Constantes compartidas backend
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js        # Tokens de diseño: colores, tipografía, espaciado
    ├── .env                      # VITE_API_URL, VITE_APP_NAME
    └── src/
        ├── main.jsx              # Monta React + AuthProvider
        ├── App.jsx               # Carga tema del sistema al iniciar
        ├── index.css             # CSS variables (:root), base styles
        ├── api/                  # Una función por endpoint, usa axiosInstance
        │   ├── axiosInstance.js  # Base URL + interceptor JWT + logout 401
        │   ├── authApi.js
        │   ├── capacitacionesApi.js
        │   ├── certificadosApi.js
        │   ├── configApi.js
        │   ├── dashboardApi.js
        │   ├── evaluacionesApi.js
        │   ├── notificacionesApi.js
        │   ├── seguimientoApi.js
        │   └── usersApi.js
        ├── components/
        │   ├── layout/
        │   │   ├── Sidebar.jsx       # Navegación lateral con roles
        │   │   ├── Navbar.jsx        # Barra superior: notificaciones, perfil
        │   │   ├── PageWrapper.jsx   # Wrapper de página: title, subtitle, actions slot
        │   │   └── Footer.jsx
        │   └── ui/
        │       ├── Icons.jsx         # Todos los iconos SVG del sistema
        │       ├── Button.jsx
        │       ├── Badge.jsx
        │       └── Input.jsx
        ├── context/
        │   └── AuthContext.jsx   # Estado global: user, token, login(), logout()
        ├── hooks/
        │   └── useAuth.js        # Acceso al AuthContext
        ├── routes/
        │   ├── AppRouter.jsx     # Todas las rutas + ProtectedRoute
        │   └── ProtectedRoute.jsx # Redirige si no autenticado o sin rol
        ├── pages/
        │   ├── auth/
        │   │   ├── Login.jsx
        │   │   ├── RecuperarPassword.jsx
        │   │   └── ResetPassword.jsx
        │   ├── dashboard/
        │   │   └── Dashboard.jsx
        │   ├── capacitaciones/
        │   │   ├── ListaCapacitaciones.jsx
        │   │   ├── DetalleCapacitacion.jsx
        │   │   ├── FormCapacitacion.jsx     # Modo crear y editar según :id en URL
        │   │   └── GestionQuiz.jsx
        │   ├── evaluaciones/
        │   │   ├── FormEvaluacion.jsx
        │   │   └── ResultadoEvaluacion.jsx
        │   ├── certificados/
        │   │   └── MisCertificados.jsx
        │   ├── seguimiento/
        │   │   └── ReporteSeguimiento.jsx
        │   ├── usuarios/
        │   │   ├── ListaUsuarios.jsx
        │   │   └── FormUsuario.jsx
        │   ├── notificaciones/
        │   │   └── Notificaciones.jsx
        │   ├── perfil/
        │   │   └── PerfilUsuario.jsx
        │   └── configuracion/
        │       └── Configuracion.jsx
        └── utils/
            ├── constants.js      # ROUTES, ROLES
            ├── theme.js          # applyTheme() — setea CSS vars en runtime
            ├── formatters.js
            └── validators.js
```

---

## 4. Base de Datos

**Nombre**: `neondb` (Neon) / `asistencias_db` (local)  
**Schema**: `sst`  
**Conexión**: siempre usa `search_path=sst`

### Tablas

| Tabla | Descripción |
|---|---|
| `sst.roles` | Roles del sistema: SUPER_USUARIO, ADMIN, FUNCIONARIO |
| `sst.usuarios` | Usuarios del sistema con hash bcrypt |
| `sst.tokens_recuperacion` | Tokens de restablecimiento de contraseña (expiran en 30 min) |
| `sst.categorias` | Categorías de capacitaciones |
| `sst.capacitaciones` | Módulos de formación SST |
| `sst.archivos_capacitacion` | Recursos de una capacitación (video, PDF, enlace, DOCX) |
| `sst.evaluaciones` | Evaluaciones ligadas a capacitaciones (tipo: normal / final) |
| `sst.preguntas` | Preguntas de cada evaluación |
| `sst.opciones_respuesta` | Opciones de cada pregunta (una es la correcta) |
| `sst.intentos_evaluacion` | Registro de intentos: puntaje, aprobado, fecha |
| `sst.detalle_intentos` | Respuesta elegida por pregunta en cada intento |
| `sst.certificados` | Certificados emitidos al aprobar (código único) |
| `sst.consultas_api` | Log de consultas a APIs externas |
| `sst.auditoria` | Log de acciones administrativas |
| `sst.configuracion_usuario` | Preferencias por usuario (clave/valor JSON) |
| `sst.configuracion_sistema` | Config global: nombre empresa, colores (auto-creada) |
| `sst.notificaciones_leidas` | Registro de notificaciones ya leídas por usuario |
| `sst.progreso_recursos` | Recursos marcados como vistos por funcionario |

### Vista Materializada

```sql
sst.mv_seguimiento_capacitacion
-- Columnas: usuario_id, nombre_completo, email, capacitacion_id,
--           titulo, completada, puntaje_max
-- Índice único en (usuario_id, capacitacion_id)
-- Requiere REFRESH CONCURRENTLY para actualizar
```

### Diagrama de relaciones clave

```
usuarios ──┬──< certificados >── capacitaciones ──< archivos_capacitacion
           ├──< intentos_evaluacion >── evaluaciones ──< preguntas ──< opciones_respuesta
           ├──< detalle_intentos
           ├──< configuracion_usuario
           ├──< tokens_recuperacion
           └──< progreso_recursos >── archivos_capacitacion
```

---

## 5. API REST — Endpoints

Base URL: `http://localhost:3000` (dev) / URL de Render (prod)

### Autenticación — `/api/auth`
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/health` | No | Health check |
| POST | `/login` | No | Login, retorna JWT + user |
| POST | `/forgot-password` | No | Solicitar recuperación (envía email) |
| POST | `/reset-password/:token` | No | Restablecer contraseña con token |
| POST | `/cambiar-password` | JWT | Cambiar contraseña desde perfil |
| PUT | `/perfil` | JWT | Actualizar nombre, email, documento |
| GET | `/perfil/stats` | JWT | Stats del perfil: capacitaciones, certs |

### Usuarios — `/api/usuarios`
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/` | JWT | Listar usuarios (todos los roles con filtros) |
| GET | `/stats` | JWT | Conteo por rol |
| GET | `/:id` | JWT | Obtener usuario por ID |
| POST | `/` | ADMIN | Crear usuario |
| PUT | `/:id` | ADMIN | Editar usuario |
| PATCH | `/:id/estado` | ADMIN | Activar / desactivar usuario |

### Capacitaciones — `/api/capacitaciones`
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/categorias` | JWT | Lista de categorías |
| GET | `/` | JWT | Listar capacitaciones (con conteos) |
| GET | `/:id` | JWT | Detalle con recursos y evaluaciones |
| POST | `/` | ADMIN | Crear capacitación |
| PUT | `/:id` | ADMIN | Editar capacitación |
| DELETE | `/:id` | ADMIN | Eliminar capacitación |
| GET | `/:id/mi-progreso` | JWT | IDs de recursos vistos por el usuario |
| POST | `/:id/recursos/:rid/visto` | JWT | Marcar recurso como visto |
| POST | `/:id/recursos` | ADMIN | Agregar recurso |
| PUT | `/:id/recursos/:rid` | ADMIN | Editar recurso |
| DELETE | `/:id/recursos/:rid` | ADMIN | Eliminar recurso |

### Evaluaciones — `/api/evaluaciones`
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/mis-intentos` | JWT | Intentos del usuario autenticado |
| GET | `/capacitacion/:capacitacion_id` | JWT | Evaluaciones de una capacitación |
| GET | `/:id/preguntas` | JWT | Preguntas para rendir la evaluación |
| POST | `/:id/submit` | JWT | Enviar respuestas y calcular puntaje |
| POST | `/capacitacion/:capacitacion_id` | ADMIN | Crear evaluación |
| GET | `/:id/admin` | ADMIN | Ver evaluación con preguntas (vista admin) |
| POST | `/:id/preguntas/nueva` | ADMIN | Agregar pregunta con opciones |
| DELETE | `/preguntas/:pid` | ADMIN | Eliminar pregunta |
| DELETE | `/:id` | ADMIN | Eliminar evaluación |

### Certificados — `/api/certificados`
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/verificar/:codigo` | No | Verificar certificado por código público |
| GET | `/mis` | JWT | Mis certificados (funcionario) |
| GET | `/` | ADMIN | Todos los certificados |
| GET | `/:id` | JWT | Detalle de un certificado |
| GET | `/:id/pdf` | JWT | Descargar certificado en PDF |

### Seguimiento — `/api/seguimiento`
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/` | ADMIN | Reporte de progreso de todos los funcionarios |
| POST | `/refresh` | ADMIN | Refresca la vista materializada |

### Dashboard — `/api/dashboard`
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/` | JWT | Stats: capacitaciones, certs, evaluaciones |
| GET | `/sin-certificar` | ADMIN | Funcionarios sin ningún certificado |

### Notificaciones — `/api/notificaciones`
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/` | JWT | Notificaciones del usuario (vencimientos, nuevas caps, evaluaciones) |
| PATCH | `/:id/leer` | JWT | Marcar una notificación como leída |
| POST | `/leer-todas` | JWT | Marcar todas como leídas |

### Configuración — `/api/config`
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/public` | No | Config global: nombre empresa, colores |
| GET | `/` | JWT | Configuración del usuario actual |
| PUT | `/` | JWT | Guardar configuración del usuario |
| PUT | `/sistema` | ADMIN | Guardar config global (nombre, colores) |

---

## 6. Autenticación y Autorización

### Flujo JWT

1. Cliente hace `POST /api/auth/login` con email + password
2. Backend verifica bcrypt, genera JWT con payload `{ id, email, rol }`
3. JWT se guarda en `localStorage` con clave `sst_token`
4. Cada request incluye `Authorization: Bearer <token>`
5. `auth.middleware.js` verifica y decodifica el token → `req.user`
6. `role.middleware.js` compara `req.user.rol` con los roles permitidos

### Expiración
- JWT: 8 horas (`JWT_EXPIRES_IN=8h`)
- Tokens de recuperación: 30 minutos (tabla `tokens_recuperacion`)

### Interceptor Axios (frontend)
- Añade automáticamente el header `Authorization`
- Si respuesta es 401, dispara evento `auth:logout` → limpia localStorage y redirige al login

---

## 7. Módulos del Frontend

### Enrutamiento

```
/ (redirect → /dashboard)
/login
/recuperar-password
/reset-password/:token

[Protegidas — cualquier rol autenticado]
/dashboard
/capacitaciones
/capacitaciones/:id
/evaluaciones
/evaluaciones/:id/preguntas
/evaluaciones/resultado
/certificados
/notificaciones
/perfil
/configuracion

[Protegidas — solo ADMIN y SUPER_USUARIO]
/usuarios
/usuarios/nuevo
/usuarios/:id/editar
/capacitaciones/nueva
/capacitaciones/:id/editar
/capacitaciones/:id/quiz
/seguimiento
```

### Estado global (AuthContext)

```js
{
  user: { id, nombre, apellido, email, rol },
  token: "eyJ...",
  isAuthenticated: true,
  login(userData, jwt),
  logout()
}
```

### Sistema de temas (CSS Variables)

Las variables `--color-*` se definen en `:root` en `index.css`.  
`theme.js:applyTheme()` sobreescribe `--color-primary` y `--color-secondary` en runtime con los valores guardados en `configuracion_sistema`.  
Se aplican al montar `App.jsx` llamando a `loadAndApplyTheme()`.

### Componentes compartidos

| Componente | Descripción |
|---|---|
| `PageWrapper` | Layout de página con título, subtítulo y slot de acciones |
| `Sidebar` | Navegación lateral, oculta ítems según rol |
| `Navbar` | Barra superior con badge de notificaciones y menú de perfil |
| `Icons.jsx` | Todos los SVG del sistema como componentes React |
| `ProtectedRoute` | HOC que redirige según `isAuthenticated` y `allowedRoles` |

---

## 8. Variables de Entorno

### Backend (`backend/.env`)

```env
# Base de datos
DATABASE_URL=postgresql://user:pass@host/db?sslmode=verify-full
# O conexión local:
DB_HOST=localhost
DB_PORT=5432
DB_NAME=asistencias_db
DB_USER=bot_asistencias
DB_PASSWORD=bot123

# JWT
JWT_SECRET=clave_secreta_muy_larga
JWT_EXPIRES_IN=8h

# Servidor
PORT=3000
NODE_ENV=development

# CORS (separados por coma)
CORS_ORIGIN=http://localhost:5173,https://tu-app.vercel.app

# Email
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=correo@dominio.com
MAIL_PASS=app_password

# Archivos
UPLOAD_PATH=src/uploads
MAX_FILE_SIZE_MB=100
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=Sistema Web SST
```

En producción `VITE_API_URL` debe apuntar a la URL de Render.

---

## 9. Cómo correr el proyecto

### Requisitos
- Node.js 18+
- PostgreSQL 15+ (local) o cuenta en Neon

### Base de datos

```bash
# Crear schema en PostgreSQL local
psql -U postgres -c "CREATE DATABASE asistencias_db;"
psql -U postgres -d asistencias_db -f schema.sql

# O usar Neon: pegar el contenido de schema.sql en el SQL editor
```

### Backend

```bash
cd backend
npm install
cp .env.example .env   # Configurar variables
npm run dev            # node --watch server.js → puerto 3000
npm run seed           # Cargar datos de prueba
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_URL=http://localhost:3000
npm run dev            # Vite → puerto 5173
```

### Usuarios de prueba (seed)

| Email | Contraseña | Rol |
|---|---|---|
| admin@sst.local | Admin1234! | SUPER_USUARIO |
| maria@empresa.com | Admin1234! | ADMIN |
| carlos@empresa.com | Usuario123! | FUNCIONARIO |

---

## 10. Roles y Permisos

| Funcionalidad | FUNCIONARIO | ADMIN | SUPER_USUARIO |
|---|---|---|---|
| Ver dashboard | ✅ (propio) | ✅ (global) | ✅ (global) |
| Ver capacitaciones | ✅ | ✅ | ✅ |
| Crear/editar/eliminar capacitaciones | ❌ | ✅ | ✅ |
| Gestionar quizzes (preguntas) | ❌ | ✅ | ✅ |
| Rendir evaluaciones | ✅ | ❌ | ❌ |
| Ver mis certificados | ✅ | ❌ | ❌ |
| Ver todos los certificados | ❌ | ✅ | ✅ |
| Descargar PDF certificado | ✅ (propios) | ✅ (todos) | ✅ (todos) |
| Reporte de seguimiento | ❌ | ✅ | ✅ |
| Gestión de usuarios | ❌ | ✅ | ✅ |
| Configuración del sistema | ❌ | ✅ | ✅ |
| Ver funcionarios sin certificar | ❌ | ✅ | ✅ |

---

## 11. Flujos Principales

### Flujo de capacitación → certificado

```
1. Admin crea capacitación con recursos (videos, PDFs, enlaces)
2. Admin crea evaluación con preguntas y opciones de respuesta
3. Funcionario accede a la capacitación → marca recursos como vistos
4. Funcionario rinde la evaluación → sistema calcula puntaje
5. Si puntaje ≥ puntaje mínimo → se emite certificado automáticamente
6. Certificado tiene código único para verificación pública en /verificar/:codigo
7. Funcionario puede descargar el certificado en PDF
```

### Flujo de recuperación de contraseña

```
1. Usuario ingresa email en /recuperar-password
2. Backend genera token UUID, lo guarda con expiración 30 min
3. Nodemailer envía email con enlace /reset-password/:token
4. Usuario abre enlace, ingresa nueva contraseña
5. Backend valida token (no usado, no expirado), actualiza hash, marca token como usado
```

### Sistema de notificaciones

Generadas dinámicamente al consultar `/api/notificaciones`:
- **Certificados próximos a vencer** (< 30 días)
- **Evaluaciones aprobadas recientemente** (últimos 7 días)
- **Nuevas capacitaciones publicadas** (últimos 14 días, solo si no tiene certificado)

### Progreso de recursos

- Cada `onClick` en un recurso llama `POST /api/capacitaciones/:id/recursos/:rid/visto`
- Se guarda en `sst.progreso_recursos`
- La barra de progreso calcula `vistos / total * 100`

### Configuración de tema

- Admin cambia colores en Configuración → Sistema
- `PUT /api/config/sistema` guarda en `sst.configuracion_sistema`
- Al cargar la app, `GET /api/config/public` retorna los colores
- `applyTheme()` setea `--color-primary` y `--color-secondary` en `:root`
- Todos los componentes usan `var(--color-primary)` → cambio instantáneo

---

## Formato de respuesta API

Todas las respuestas siguen el mismo formato:

```json
{
  "success": true,
  "data": { ... },
  "message": "Descripción opcional"
}
```

En caso de error:

```json
{
  "success": false,
  "data": null,
  "message": "Descripción del error"
}
```
