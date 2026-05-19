# RULES.md — Frontend

> Stack: React.js · TailwindCSS · Axios · React Router  
> Repositorio independiente. Deploy en Render (Static Site).

---

## 1. Estructura de carpetas

```
frontend/
├── public/                     # Archivos estáticos (favicon, logos, etc.)
├── src/
│   ├── api/                    # Instancias de Axios y llamadas a endpoints
│   │   ├── axiosInstance.js    # Configuración base de Axios (baseURL, interceptors)
│   │   ├── authApi.js
│   │   ├── usersApi.js
│   │   ├── capacitacionesApi.js
│   │   ├── evaluacionesApi.js
│   │   ├── certificadosApi.js
│   │   └── dashboardApi.js
│   │
│   ├── assets/                 # Imágenes, íconos, fuentes locales
│   │
│   ├── components/             # Componentes reutilizables (sin lógica de negocio)
│   │   ├── ui/                 # Componentes base: Button, Input, Modal, Badge, etc.
│   │   ├── layout/             # Sidebar, Navbar, Footer, PageWrapper
│   │   └── shared/             # Componentes específicos del dominio reutilizables
│   │                           # Ej: CertificadoCard, VideoPlayer, QuizQuestion
│   │
│   ├── context/                # React Context: AuthContext, UIContext
│   │
│   ├── hooks/                  # Custom hooks: useAuth, useFetch, usePagination
│   │
│   ├── pages/                  # Una carpeta por módulo funcional
│   │   ├── auth/               # Login, RecuperarPassword
│   │   ├── dashboard/          # Dashboard principal
│   │   ├── usuarios/           # ListaUsuarios, FormUsuario
│   │   ├── capacitaciones/     # ListaCapacitaciones, DetalleCapacitacion, FormCapacitacion
│   │   ├── evaluaciones/       # FormEvaluacion, ResultadoEvaluacion
│   │   ├── certificados/       # MisCertificados
│   │   ├── seguimiento/        # ReporteSeguimiento
│   │   └── consultas/          # HistorialConsultas, ConsultaAntecedentesMiembros
│   │
│   ├── routes/                 # Definición de rutas y guardas
│   │   ├── AppRouter.jsx       # Árbol principal de rutas
│   │   └── ProtectedRoute.jsx  # Guarda de autenticación y roles
│   │
│   ├── utils/                  # Funciones utilitarias puras
│   │   ├── formatters.js       # Fechas, moneda, texto
│   │   ├── validators.js       # Validaciones de formularios
│   │   └── constants.js        # Roles, estados, rutas de API
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── .env                        # Variables de entorno (no commitear)
├── .env.example                # Plantilla de variables
├── .gitignore
├── tailwind.config.js
├── vite.config.js
├── package.json
└── RULES.md
```

---

## 2. Convenciones de nombres

### Archivos y carpetas

| Tipo | Convención | Ejemplo |
|------|-----------|---------|
| Componentes React | PascalCase | `UserCard.jsx` |
| Páginas | PascalCase | `ListaUsuarios.jsx` |
| Hooks | camelCase con prefijo `use` | `useAuth.js` |
| Utilidades / helpers | camelCase | `formatters.js` |
| Archivos de API | camelCase con sufijo `Api` | `usersApi.js` |
| Contextos | PascalCase con sufijo `Context` | `AuthContext.jsx` |
| Carpetas | kebab-case o camelCase en minúsculas | `capacitaciones/` |

### Variables y funciones

- Variables y funciones: `camelCase`
- Constantes globales: `UPPER_SNAKE_CASE`
- Componentes: `PascalCase`
- Clases CSS personalizadas (Tailwind): preferir clases utilitarias; si se crea una clase custom, usar `kebab-case`

---

## 3. Stack y dependencias

### Dependencias de producción

| Paquete | Uso |
|---------|-----|
| `react` + `react-dom` | UI base |
| `react-router-dom` | Enrutamiento SPA |
| `axios` | Peticiones HTTP |
| `tailwindcss` | Estilos utilitarios |

### Dependencias sugeridas

| Paquete | Uso |
|---------|-----|
| `react-hook-form` | Manejo de formularios |
| `recharts` | Gráficas del dashboard |
| `react-toastify` | Notificaciones toast |
| `react-pdf` o `pdfjs-dist` | Visualización de PDFs |
| `qrcode.react` | Renderizar QR en certificados |
| `dayjs` | Manipulación de fechas |

### Variables de entorno (`.env`)

```env
VITE_API_URL=https://api.tudominio.com
VITE_APP_NAME=Sistema de Capacitaciones
```

> Todas las variables deben tener el prefijo `VITE_` para ser accesibles en Vite.

---

## 4. Reglas de desarrollo

### Componentes

- Un componente por archivo.
- Los componentes en `ui/` no deben tener lógica de negocio ni llamadas a API.
- Usar `props` tipadas con PropTypes o JSDoc cuando no se usa TypeScript.
- Evitar componentes mayores a 200 líneas; extraer sub-componentes si es necesario.

### Llamadas a API

- Toda llamada HTTP va en `src/api/`. Las páginas y componentes nunca importan Axios directamente.
- El `axiosInstance.js` maneja: `baseURL`, headers de autorización (JWT), e interceptores para `401 → logout`.

### Rutas y acceso

- Todas las rutas privadas pasan por `ProtectedRoute.jsx`.
- El componente debe verificar: (1) si hay sesión activa, (2) si el rol tiene permiso para esa ruta.
- Roles disponibles: `SUPER_USUARIO`, `ADMIN`, `FUNCIONARIO` (definidos en `utils/constants.js`).

### Estado global

- Usar `AuthContext` para datos de sesión (usuario, token, rol).
- No usar Context para estado local de formularios o modales; usar estado local (`useState`).

### Estilos

- Usar exclusivamente clases de Tailwind en los componentes.
- No escribir CSS inline salvo casos excepcionales (animaciones dinámicas).
- El tema de colores corporativos se define en `tailwind.config.js` bajo `theme.extend.colors`.

---

## 5. Git

### Ramas

```
main          → producción (protegida)
develop       → integración
feature/*     → nuevas funcionalidades
fix/*         → correcciones de bugs
```

### Mensajes de commit (Conventional Commits)

```
feat: agregar página de evaluaciones
fix: corregir validación de login
style: ajustar responsividad del dashboard
refactor: extraer componente QuizQuestion
chore: actualizar dependencias
```

---

## 6. Módulos del sistema

| Módulo | Página(s) | Rol |
|--------|-----------|-----|
| Autenticación | Login, RecuperarPassword | Todos |
| Usuarios | ListaUsuarios, FormUsuario | SUPER_USUARIO / ADMIN |
| Capacitaciones | ListaCapacitaciones, DetalleCapacitacion, FormCapacitacion | ADMIN / FUNCIONARIO |
| Evaluaciones | FormEvaluacion, ResultadoEvaluacion | FUNCIONARIO |
| Certificados | MisCertificados | FUNCIONARIO |
| Seguimiento | ReporteSeguimiento | ADMIN |
| Consultas externas | HistorialConsultas, ConsultaEmpleado | ADMIN |
| Dashboard | Dashboard | SUPER_USUARIO / ADMIN |
| Auditoría | RegistroAuditoria | SUPER_USUARIO |

---

## 7. Roles del sistema

| Constante | Descripción |
|-----------|-------------|
| `SUPER_USUARIO` | Control total del sistema, acceso a auditoría |
| `ADMIN` | Gestiona cursos, usuarios y reportes |
| `FUNCIONARIO` | Consume capacitaciones y presenta evaluaciones |

Definidos en `utils/constants.js`:

```js
export const ROLES = {
  SUPER_USUARIO: 'SUPER_USUARIO',
  ADMIN: 'ADMIN',
  FUNCIONARIO: 'FUNCIONARIO',
};
```

---

## 8. Fecha de entrega

**30 de junio de 2026.** El sistema debe estar desplegado públicamente con frontend, backend y base de datos funcionales.

# RULES.md — Backend

> Stack: Node.js · Express.js · JWT · Multer · Nodemailer · PostgreSQL  
> Repositorio independiente. Deploy en Render (Web Service).

---

## 1. Estructura de carpetas

```
backend/
├── src/
│   ├── config/                 # Configuración centralizada
│   │   ├── db.js               # Pool de conexión a PostgreSQL (pg)
│   │   ├── mailer.js           # Configuración de Nodemailer
│   │   └── multer.js           # Configuración de Multer (tipos, tamaños, destino)
│   │
│   ├── middlewares/            # Middlewares de Express
│   │   ├── auth.middleware.js  # Verificación de JWT
│   │   ├── role.middleware.js  # Control de acceso por rol
│   │   ├── upload.middleware.js# Middleware de Multer para rutas específicas
│   │   ├── error.middleware.js # Manejador global de errores
│   │   └── validate.middleware.js # Validación de body con esquemas
│   │
│   ├── modules/                # Un módulo por dominio funcional
│   │   ├── auth/
│   │   │   ├── auth.routes.js
│   │   │   ├── auth.controller.js
│   │   │   └── auth.service.js
│   │   ├── usuarios/
│   │   │   ├── usuarios.routes.js
│   │   │   ├── usuarios.controller.js
│   │   │   └── usuarios.service.js
│   │   ├── capacitaciones/
│   │   │   ├── capacitaciones.routes.js
│   │   │   ├── capacitaciones.controller.js
│   │   │   └── capacitaciones.service.js
│   │   ├── evaluaciones/
│   │   │   ├── evaluaciones.routes.js
│   │   │   ├── evaluaciones.controller.js
│   │   │   └── evaluaciones.service.js
│   │   ├── certificados/
│   │   │   ├── certificados.routes.js
│   │   │   ├── certificados.controller.js
│   │   │   └── certificados.service.js
│   │   ├── seguimiento/
│   │   │   ├── seguimiento.routes.js
│   │   │   ├── seguimiento.controller.js
│   │   │   └── seguimiento.service.js
│   │   ├── consultas/
│   │   │   ├── consultas.routes.js
│   │   │   ├── consultas.controller.js
│   │   │   └── consultas.service.js
│   │   ├── dashboard/
│   │       ├── dashboard.routes.js
│   │       ├── dashboard.controller.js
│   │       └── dashboard.service.js
│   │   └── auditoria/
│   │       ├── auditoria.routes.js
│   │       ├── auditoria.controller.js
│   │       └── auditoria.service.js
│   │
│   ├── utils/                  # Funciones utilitarias
│   │   ├── response.js         # Formato estándar de respuesta { success, data, message }
│   │   ├── jwt.js              # Generación y verificación de tokens
│   │   ├── password.js         # Hash y comparación con bcrypt
│   │   ├── pdf.js              # Generación de certificados PDF
│   │   └── constants.js        # Roles, estados, configuraciones fijas
│   │
│   ├── uploads/                # Archivos subidos (videos, PDFs) — excluir del repo
│   │
│   └── app.js                  # Instancia de Express, registro de rutas y middlewares
│
├── server.js                   # Punto de entrada: inicia el servidor
├── .env                        # Variables de entorno (no commitear)
├── .env.example                # Plantilla de variables
├── .gitignore
├── package.json
└── RULES.md
```

---

## 2. Convenciones de nombres

### Archivos

| Tipo | Convención | Ejemplo |
|------|-----------|---------|
| Rutas | `[modulo].routes.js` | `auth.routes.js` |
| Controlador | `[modulo].controller.js` | `usuarios.controller.js` |
| Servicio | `[modulo].service.js` | `capacitaciones.service.js` |
| Middleware | `[nombre].middleware.js` | `auth.middleware.js` |
| Utilidades | camelCase | `response.js`, `jwt.js` |
| Configuración | camelCase | `db.js`, `mailer.js` |

### Variables y funciones

- Variables y funciones: `camelCase`
- Constantes globales: `UPPER_SNAKE_CASE`
- Clases/constructores: `PascalCase`
- Tablas de base de datos: `snake_case` (ej. `intentos_evaluacion`)
- Columnas de BD: `snake_case` (ej. `fecha_creacion`, `id_usuario`)

---

## 3. Arquitectura por módulo

Cada módulo sigue la separación en tres capas:

```
routes.js       → Define los endpoints y aplica middlewares
controller.js   → Recibe req/res, llama al service, responde con formato estándar
service.js      → Contiene la lógica de negocio y consultas SQL a PostgreSQL
```

**Reglas:**
- Los controladores nunca ejecutan queries directamente.
- Los servicios no conocen `req` ni `res`.
- Las queries SQL van siempre en el servicio correspondiente.

---

## 4. Stack y dependencias

### Dependencias de producción

| Paquete | Uso |
|---------|-----|
| `express` | Framework HTTP |
| `pg` | Cliente PostgreSQL |
| `bcryptjs` | Hash de contraseñas |
| `jsonwebtoken` | Generación y verificación de JWT |
| `multer` | Carga de archivos (videos, PDFs) |
| `nodemailer` | Envío de correos (recuperación, certificados) |
| `cors` | Configuración de CORS |
| `dotenv` | Variables de entorno |

### Dependencias sugeridas

| Paquete | Uso |
|---------|-----|
| `express-rate-limit` | Rate limiting en rutas sensibles |
| `puppeteer` o `pdfkit` | Generación de certificados PDF |
| `qrcode` | Generación de códigos QR para certificados |
| `express-validator` | Validación de entradas |
| `morgan` | Logging de peticiones HTTP |
| `helmet` | Headers de seguridad |
| `uuid` | Generación de identificadores únicos |

### Variables de entorno (`.env`)

```env
PORT=3000
NODE_ENV=development

# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=capacitaciones_db
DB_USER=postgres
DB_PASSWORD=secret

# JWT
JWT_SECRET=supersecret
JWT_EXPIRES_IN=8h

# Nodemailer
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=correo@dominio.com
MAIL_PASS=apppassword

# Almacenamiento de archivos
UPLOAD_PATH=src/uploads
MAX_FILE_SIZE_MB=100

# APIs externas
ANTECEDENTES_API_URL=https://api.externa.gov.co
ANTECEDENTES_API_KEY=key123
```

---

## 5. Formato de respuesta estándar

Toda respuesta de la API usa el helper `utils/response.js`:

```json
// Éxito
{ "success": true, "data": { ... }, "message": "Operación exitosa" }

// Error
{ "success": false, "data": null, "message": "Descripción del error" }
```

Códigos HTTP usados:

| Código | Uso |
|--------|-----|
| `200` | OK |
| `201` | Creado |
| `400` | Datos inválidos / error de validación |
| `401` | No autenticado |
| `403` | Sin permisos (rol insuficiente) |
| `404` | Recurso no encontrado |
| `500` | Error interno del servidor |

---

## 6. Seguridad

- Todas las rutas privadas requieren el middleware `auth.middleware.js` (verifica JWT).
- Las rutas de administrador aplican además `role.middleware.js` con rol `ADMIN` o `SUPER_USUARIO`.
- Las contraseñas nunca se almacenan en texto plano; usar `bcryptjs` con salt rounds ≥ 10.
- Los tokens JWT tienen expiración máxima de 8 horas.
- Los archivos subidos se validan por tipo MIME y tamaño máximo en `config/multer.js`.
- Usar `helmet` para headers de seguridad HTTP.
- Usar `express-rate-limit` en rutas sensibles (`/api/auth`, `/api/consultas`) — máximo 20 req/min por IP.
- Configurar CORS explícitamente con la URL del frontend.
- Todas las queries usan parámetros (`$1, $2`) — nunca interpolación de strings (RNF10: SQL Injection).
- Sanitizar entradas en rutas públicas para prevenir XSS (RNF10).
- Implementar logs de auditoría para acciones críticas (RNF09): login, cambio de rol, consulta API.

---

## 7. Base de datos (PostgreSQL)

- El pool de conexión se configura en `config/db.js` y se exporta como instancia única.
- Usar `pg` con queries parametrizadas (`$1, $2, ...`) — nunca interpolación de strings.
- Nombres de tablas y columnas en `snake_case`.
- Toda tabla debe tener: `id SERIAL PRIMARY KEY`, `created_at TIMESTAMPTZ DEFAULT NOW()`, `updated_at TIMESTAMPTZ`.
- Las migraciones o scripts SQL se guardan en `/database/migrations/` (fuera de `src/`).

### Entidades del MER (según documento del proyecto)

```
usuarios              id, nombre, email, password, rol_id, estado
roles                 id, nombre
capacitaciones        id, titulo, descripcion, video_url, pdf_url, categoria_id, fecha_vigencia
categorias            id, nombre
archivos_capacitacion id, capacitacion_id, tipo (video|pdf), url, nombre_archivo
evaluaciones          id, capacitacion_id, pregunta, respuesta_correcta, puntaje_minimo
intentos_evaluacion   id, usuario_id, evaluacion_id, puntaje, fecha, aprobado
certificados          id, usuario_id, capacitacion_id, codigo_certificado, qr_codigo, fecha_emision
consultas_api         id, usuario_consultado, entidad, respuesta (jsonb), fecha, usuario_id
auditoria             id, usuario_id, accion, tabla_afectada, detalle, fecha
```

---

## 8. Archivos subidos (Multer)

- En **desarrollo**: almacenar en `src/uploads/` con subcarpetas por tipo:
  ```
  uploads/
  ├── videos/
  └── documentos/
  ```
- En **producción (Render)**: usar **Cloudinary** o **AWS S3** — el disco de Render es efímero.
- El nombre del archivo: `{uuid}-{timestamp}.{ext}` para evitar colisiones.
- Los archivos locales no se commitean (`.gitignore`).
- La URL pública del archivo se guarda en BD (`video_url`, `pdf_url`).

---

## 9. APIs externas

Las consultas de antecedentes consumen APIs gubernamentales colombianas. Todas las llamadas van en `modules/consultas/consultas.service.js`.

| Entidad | Mecanismo |
|---------|-----------|
| Fiscalía General de la Nación | REST API / Open Data |
| Policía Nacional de Colombia | REST API / SOAP |
| Contraloría General de la República | REST API / Open Data |
| Procuraduría General de la Nación | REST API / Web Scraping controlado |

**Reglas:**
- Toda respuesta externa se almacena en `consultas_api` con `jsonb` para preservar la estructura original.
- Si la API externa falla, retornar error controlado — nunca propagar el error crudo al frontend.
- Registrar `fecha`, `entidad`, `usuario_consultado` y `resultado` en cada consulta (RF09).

---

## 10. Roles del sistema

| Constante | Descripción |
|-----------|-------------|
| `SUPER_USUARIO` | Control total, acceso a auditoría del sistema |
| `ADMIN` | Gestiona cursos, usuarios y reportes |
| `FUNCIONARIO` | Consume capacitaciones y presenta evaluaciones |

Definidos en `utils/constants.js`:

```js
const ROLES = {
  SUPER_USUARIO: 'SUPER_USUARIO',
  ADMIN: 'ADMIN',
  FUNCIONARIO: 'FUNCIONARIO',
};
```

---

## 11. Git

### Ramas

```
main          → producción (protegida)
develop       → integración
feature/*     → nuevas funcionalidades
fix/*         → correcciones de bugs
```

### Mensajes de commit (Conventional Commits)

```
feat: crear endpoint de generación de certificados
fix: corregir validación de token expirado
refactor: separar lógica de consultas externas en service
chore: agregar variable de entorno para API antecedentes
docs: actualizar RULES.md con tabla de endpoints
```

---

## 12. Módulos y endpoints (resumen)

| Módulo | Prefijo de ruta | RF | Roles |
|--------|----------------|----|-------|
| Auth | `/api/auth` | RF01 | Todos |
| Usuarios | `/api/usuarios` | RF02 | SUPER_USUARIO / ADMIN |
| Capacitaciones | `/api/capacitaciones` | RF03, RF04 | ADMIN / FUNCIONARIO |
| Evaluaciones | `/api/evaluaciones` | RF05 | FUNCIONARIO |
| Certificados | `/api/certificados` | RF06 | FUNCIONARIO |
| Seguimiento | `/api/seguimiento` | RF07 | ADMIN |
| Consultas externas | `/api/consultas` | RF08, RF09 | ADMIN |
| Dashboard | `/api/dashboard` | RF10 | SUPER_USUARIO / ADMIN |
| Auditoría | `/api/auditoria` | RNF09 | SUPER_USUARIO |

---

## 13. Fecha de entrega

**30 de junio de 2026.** Todos los entregables deben estar publicados:
- Frontend en Render (Static Site)
- Backend en Render (Web Service)
- Base de datos PostgreSQL funcional
- Repositorio GitHub con README y enlace al deploy