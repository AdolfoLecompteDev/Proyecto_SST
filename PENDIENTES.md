# SST — Pendientes para completar el sistema

> Auditoría completa al 2026-06-24. Todo lo que falta para que el sistema esté 100% funcional sin hardcode ni stubs.

---

## 🔴 CRÍTICO — Rompe funcionalidad existente

### 1. Recuperar contraseña (RecuperarPassword.jsx)
**Problema:** Usa `setTimeout` falso, nunca llama al backend.  
**Backend:** `tokens_recuperacion` existe en DB pero nunca se usa.  
**Falta:**
- `POST /api/auth/forgot-password` → genera token, envía email
- `POST /api/auth/reset-password/:token` → valida token, actualiza hash
- Configurar MAIL (SMTP/Resend/SendGrid) — `.env` tiene `MAIL_HOST` sin implementar
- Frontend: conectar formulario a API real

### 2. Descarga de certificados PDF (MisCertificados.jsx)
**Problema:** Botón "PDF" no tiene `onClick`, no existe endpoint.  
**Falta:**
- `GET /api/certificados/:id/pdf` → genera PDF con datos del certificado
- Librería: `pdfkit` o `puppeteer` en backend
- Frontend: `onClick` que descargue el blob

### 3. Guardar configuración del sistema (Configuracion.jsx)
**Problema:** Todo el formulario (notificaciones, seguridad, sistema, equipo) vive solo en React state. Al recargar se pierde.  
**Falta:**
- Tabla DB: `sst.configuracion_usuario (usuario_id, clave, valor)`
- `GET /api/config` → carga preferencias del usuario actual
- `PUT /api/config` → guarda preferencias
- Frontend: cargar al montar, submit real al guardar

---

## 🟠 ALTO — Funcionalidad prometida que no existe

### 4. Editar / Eliminar capacitación desde frontend (RF03 — CRUD Obligatorio)
**Problema:** `PUT /api/capacitaciones/:id` existe en backend ✅ pero `FormCapacitacion.jsx` no soporta modo edición (no usa `useParams`, no carga datos). No existe ruta `/capacitaciones/:id/editar` en `AppRouter`. Tampoco existe `DELETE /api/capacitaciones/:id`.  
**Falta:**
- `DELETE /api/capacitaciones/:id` → endpoint backend (adminOnly)
- Ruta `/capacitaciones/:id/editar` en AppRouter
- `FormCapacitacion` detectar edición por `useParams`, cargar datos, submit a PUT
- Botón "Editar" y "Eliminar" en `DetalleCapacitacion` (admin only)

### 5. Subida de archivos / videos a capacitaciones
**Problema:** FormCapacitacion dice "podrás subir archivos después de crear" pero nunca aparece esa UI.  
**Backend:** Multer está configurado en `src/config/multer.js` pero **ninguna ruta lo usa**.  
**Falta:**
- `POST /api/capacitaciones/:id/archivos` → sube archivo (multer middleware)
- `GET /api/capacitaciones/:id/archivos` → lista archivos de esa cap
- `DELETE /api/capacitaciones/:id/archivos/:archivoId` → elimina
- Frontend: sección en DetalleCapacitacion con listado + upload + delete
- Soporte videos: YouTube embed o archivo de video (.mp4)

### 6. Gestión de evaluaciones (CRUD desde admin)
**Problema:** No existe interfaz para que admin cree/edite evaluaciones y preguntas. Solo el alumno puede rendir la evaluación.  
**Falta:**
- `POST /api/evaluaciones` → crear evaluación ligada a capacitación
- `PUT /api/evaluaciones/:id` → editar título/puntaje mínimo/intentos
- `DELETE /api/evaluaciones/:id`
- `POST /api/evaluaciones/:id/preguntas` → agregar pregunta con opciones
- `PUT /api/preguntas/:id` → editar pregunta
- `DELETE /api/preguntas/:id`
- Frontend: tab "Evaluaciones" en DetalleCapacitacion con formulario de creación y lista de preguntas editables

### 7. Exportar CSV en seguimiento (ReporteSeguimiento.jsx)
**Problema:** Botón "Exportar CSV" no tiene `onClick`.  
**Falta:**
- `GET /api/seguimiento/export` → retorna CSV con todos los empleados y progreso
- O generación client-side con los datos ya cargados (más simple)
- Frontend: `onClick` que descargue archivo `.csv`

### 8. Formulario de usuario — editar usuario existente (FormUsuario.jsx)
**Verificar:** La ruta `/usuarios/:id/editar` ¿existe en AppRouter? El botón "Editar" en ListaUsuarios ¿navega a algún lado?  
**Falta (si no está):**
- Ruta `/usuarios/:id/editar` en AppRouter
- FormUsuario debe detectar si es edición (`useParams`) y cargar datos del usuario
- `GET /api/usuarios/:id` → obtener un usuario por id
- `PUT /api/usuarios/:id` → ya existe en backend ✅

### 9. Historial de consultas — no muestra detalle real
**Problema:** HistorialConsultas.jsx muestra registros pero sin detalle expandible de los 4 paneles (Registraduría, Procuraduría, etc.).  
**Falta:**
- `GET /api/consultas/historial/:id` → detalle de una consulta específica
- Frontend: modal o panel expandible con los resultados de cada entidad

---

## 🟡 MEDIO — Features incompletos / UX roto

### 10. Enviar certificado por correo electrónico (RF06 — Obligatorio)
**Problema:** PDF exige "Enviar certificados por correo". `nodemailer` instalado y `mailer.js` configurado con `transporter`, pero **ningún módulo llama a `transporter.sendMail()`**.  
**Falta:**
- Servicio `enviarCertificado(email, certData)` usando `mailer.js`
- `POST /api/certificados/:id/enviar-correo` → genera PDF en memoria, adjunta al email, envía
- Configurar `.env`: `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS` (usar Mailtrap para dev, Resend/SendGrid para prod)
- Frontend: botón "Enviar por correo" en tarjeta de certificado

### 11. QR code en certificados (RF06)
**Problema:** PDF exige "Incluir código QR o consecutivo". `codigo_certificado` existe en DB ✅ pero no hay generación de QR en el PDF del certificado.  
**Falta:**
- Librería `qrcode` en backend
- Al generar PDF de certificado, incluir QR apuntando a `GET /api/certificados/verificar/:codigo`
- QR debe ser legible y verificable públicamente

### 12. Compartir certificado (MisCertificados.jsx)
**Problema:** Botón Share no tiene `onClick`.  
**Opciones:**
- URL pública de verificación ya existe (`GET /api/certificados/verificar/:codigo`)
- Falta: botón que copie `https://dominio/verificar/{codigo_certificado}` al portapapeles
- Alternativa: compartir por email

### 13. Contador de roles en Configuración — hardcodeado
**Problema:** Configuracion.jsx muestra `[{ label: 'Super Usuarios', val: 1 }, { label: 'Administradores', val: 2 }, { label: 'Funcionarios', val: 3 }]` — valores estáticos.  
**Falta:**
- `GET /api/usuarios/stats-roles` → cuenta por rol desde DB
- Frontend: cargar conteo real

### 14. Vista detalle capacitación para funcionario — evaluación accesible
**Verificar:** DetalleCapacitacion.jsx ¿muestra correctamente el botón de iniciar evaluación para funcionario? ¿El flujo completo funciona: ver cap → iniciar eval → responder → ver resultado → certificado?  
**Falta:** Confirmar flujo end-to-end sin errores.

### 15. Integración real de APIs de antecedentes
**Problema:** `consultas.service.js` simula las 4 APIs (Registraduría, Procuraduría, Contraloría, PONAL) con un hash del número de documento. PONAL siempre retorna `exitosa: false, pendiente: true`.  
**Falta:** Integrar APIs reales del gobierno colombiano o documentar explícitamente que es simulación de desarrollo.

### 16. Autenticación de dos factores (Configuracion.jsx)
**Problema:** Toggle 2FA existe en UI pero no persiste ni tiene lógica.  
**Falta:** Implementar 2FA (TOTP con `speakeasy` o SMS) o eliminar el toggle del UI.

---

## 🔴 CRÍTICO ADICIONAL — Del PDF (obligatorios no contemplados)

### 17. Deploy público (Sección 17 — Funcionalidad Obligatoria)
**Problema:** El PDF marca "Deploy Público" como **obligatorio** con 10% de calificación. No existe ningún deploy.  
**Falta:**
- Backend: publicar en Railway / Render / VPS
- Frontend: publicar en Vercel / Netlify / Railway
- DB: PostgreSQL en Railway o instancia RDS
- Variables de entorno configuradas en prod (JWT_SECRET, DB_*, MAIL_*)
- HTTPS habilitado (requisito RNF infraestructura)

### 18. Seguridad: Helmet + Rate Limiting (RNF seguridad — sección 12 del PDF)
**Problema:** PDF requiere explícitamente Helmet y Rate Limiting. Ninguno está instalado ni usado.  
**Falta:**
- `npm install helmet express-rate-limit` en backend
- `app.use(helmet())` en `server.js`
- `app.use(rateLimit({ windowMs: 15*60*1000, max: 100 }))` en rutas de auth
- CORS ya existe ✅

### 19. Almacenamiento multimedia externo — S3 / Cloudinary (RF03/RF04)
**Problema:** Multer guarda archivos en disco local. En deploy, los archivos no persisten entre reinicios y no escalan.  
**Falta:**
- Instalar `multer-storage-cloudinary` o AWS S3 SDK
- Configurar bucket/carpeta en Cloudinary (recomendado: plan free funciona)
- Guardar `video_url` y `pdf_url` en tabla `sst.capacitaciones` (columnas ya existen ✅)
- Frontend: mostrar video embed + link descarga PDF en `DetalleCapacitacion`

---

## 🟢 BAJO — Limpieza y mejoras

### 20. Tablas DB sin usar
| Tabla | Estado |
|-------|--------|
| `sst.tokens_recuperacion` | Creada, nunca usada (ver ítem 1) |
| `sst.permisos` | Creada, sin queries en código |
| `sst.auditoria` | Creada, sin módulo que escriba en ella |

### 21. Auditoría de acciones (audit log)
**Tabla `sst.auditoria` existe** pero ningún módulo registra eventos.  
**Falta:** Middleware o llamadas explícitas en controllers para registrar: login, crear/editar/eliminar usuarios, emitir certificados, cambiar passwords.

### 22. Eliminar usuario (soft delete)
**Falta:** `DELETE /api/usuarios/:id` → marcar `estado = false`, no borrar físicamente.  
Backend tiene `toggle-estado` pero no delete explícito.

### 23. Búsqueda global (Navbar)
**Problema:** Input de búsqueda en Navbar no tiene funcionalidad.  
**Falta:** Implementar búsqueda o remover el input.

---

## 📋 Resumen de endpoints faltantes

| Endpoint | Método | Prioridad |
|----------|--------|-----------|
| `/api/auth/forgot-password` | POST | 🔴 Crítico |
| `/api/auth/reset-password/:token` | POST | 🔴 Crítico |
| `/api/certificados/:id/pdf` | GET | 🔴 Crítico |
| `/api/config` | GET + PUT | 🔴 Crítico |
| `/api/capacitaciones/:id` | DELETE | 🟠 Alto |
| `/api/capacitaciones/:id/archivos` | GET + POST + DELETE | 🟠 Alto |
| `/api/certificados/:id/enviar-correo` | POST | 🟠 Alto |
| `/api/evaluaciones` | POST + PUT + DELETE | 🟠 Alto |
| `/api/evaluaciones/:id/preguntas` | POST + PUT + DELETE | 🟠 Alto |
| `/api/seguimiento/export` | GET | 🟠 Alto |
| `/api/usuarios/:id` | GET | 🟠 Alto |
| `/api/consultas/historial/:id` | GET | 🟡 Medio |
| `/api/usuarios/stats-roles` | GET | 🟡 Medio |
| `/api/usuarios/:id` | DELETE | 🟢 Bajo |

---

## 📁 Archivos frontend con botones/acciones sin implementar

| Archivo | Elemento | Estado |
|---------|----------|--------|
| `RecuperarPassword.jsx` | Formulario completo | setTimeout falso |
| `MisCertificados.jsx` | Botón "PDF" | sin onClick |
| `MisCertificados.jsx` | Botón "Share" | sin onClick |
| `MisCertificados.jsx` | Botón "Enviar correo" | no existe |
| `ReporteSeguimiento.jsx` | Botón "Exportar CSV" | sin onClick |
| `Configuracion.jsx` | Botón "Guardar cambios" | sin onClick |
| `Configuracion.jsx` | Toggle 2FA | sin persistencia |
| `Configuracion.jsx` | Conteo de roles | hardcodeado |
| `Navbar.jsx` | Input búsqueda | sin funcionalidad |
| `DetalleCapacitacion.jsx` | Sección archivos/videos/PDF | no existe UI |
| `DetalleCapacitacion.jsx` | Botones Editar/Eliminar (admin) | no existen |
| `FormCapacitacion.jsx` | Modo edición | no implementado |

## 🚀 Para cumplir calificación (sección 17 PDF)

| Funcionalidad Obligatoria | Estado actual |
|--------------------------|---------------|
| Login JWT | ✅ Completo |
| CRUD Usuarios | ⚠️ Falta editar y eliminar |
| CRUD Capacitaciones | ⚠️ Falta editar UI, eliminar, y archivos |
| Carga Videos | ❌ No implementado |
| PDFs (material capacitación) | ❌ No implementado |
| Evaluaciones | ⚠️ Alumno OK, admin CRUD falta |
| Certificados | ⚠️ Generación en DB OK, falta PDF + correo + QR |
| Consumo APIs | ⚠️ Simulado, no real |
| Dashboard | ✅ Completo |
| Deploy Público | ❌ No existe |
