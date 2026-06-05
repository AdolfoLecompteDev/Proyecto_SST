import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../../../.env') })

import pool from './db.js'
import { hashPassword } from '../utils/password.js'

async function seed() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    console.log('🌱 Iniciando semilla SST...')

    // ── Limpiar datos previos (orden inverso de FK) ──────────────────────────
    await client.query('DELETE FROM sst.auditoria')
    await client.query('DELETE FROM sst.consultas_api')
    await client.query('DELETE FROM sst.certificados')
    await client.query('DELETE FROM sst.detalle_intentos')
    await client.query('DELETE FROM sst.intentos_evaluacion')
    await client.query('DELETE FROM sst.opciones_respuesta')
    await client.query('DELETE FROM sst.preguntas')
    await client.query('DELETE FROM sst.evaluaciones')
    await client.query('DELETE FROM sst.archivos_capacitacion')
    await client.query('DELETE FROM sst.capacitaciones')
    await client.query('DELETE FROM sst.tokens_recuperacion')
    await client.query('DELETE FROM sst.usuarios')

    // ── Roles (ya existen del schema, sólo verificar) ───────────────────────
    const { rows: roles } = await client.query('SELECT id, nombre FROM sst.roles')
    const rolId = Object.fromEntries(roles.map((r) => [r.nombre, r.id]))

    // ── Usuarios de prueba ───────────────────────────────────────────────────
    const usuarios = [
      { nombre: 'Super',    apellido: 'Admin',      email: 'admin@sst.local',       pass: 'Admin1234!',  rol: 'SUPER_USUARIO', doc: '1000000001' },
      { nombre: 'María',    apellido: 'Rodríguez',  email: 'maria@empresa.com',      pass: 'Admin1234!',  rol: 'ADMIN',         doc: '1000000002' },
      { nombre: 'Carlos',   apellido: 'Pérez',      email: 'carlos@empresa.com',     pass: 'Usuario123!', rol: 'FUNCIONARIO',   doc: '1000000003' },
      { nombre: 'Diana',    apellido: 'López',      email: 'diana@empresa.com',      pass: 'Usuario123!', rol: 'FUNCIONARIO',   doc: '1000000004' },
      { nombre: 'Jorge',    apellido: 'Silva',      email: 'jorge@empresa.com',      pass: 'Usuario123!', rol: 'FUNCIONARIO',   doc: '1000000005' },
      { nombre: 'Luisa',    apellido: 'Martínez',   email: 'luisa@empresa.com',      pass: 'Usuario123!', rol: 'FUNCIONARIO',   doc: '1000000006' },
      { nombre: 'Andrés',   apellido: 'González',   email: 'andres@empresa.com',     pass: 'Usuario123!', rol: 'FUNCIONARIO',   doc: '1000000007' },
      { nombre: 'Paola',    apellido: 'Vargas',     email: 'paola@empresa.com',      pass: 'Usuario123!', rol: 'ADMIN',         doc: '1000000008' },
    ]

    const userIds = {}
    for (const u of usuarios) {
      const hash = await hashPassword(u.pass)
      const { rows } = await client.query(
        `INSERT INTO sst.usuarios (nombre, apellido, email, password_hash, documento, rol_id)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
        [u.nombre, u.apellido, u.email, hash, u.doc, rolId[u.rol]],
      )
      userIds[u.email] = rows[0].id
    }
    console.log(`  ✓ ${usuarios.length} usuarios creados`)

    const adminId = userIds['admin@sst.local']

    // ── Categorías (ya existen del schema) ───────────────────────────────────
    const { rows: cats } = await client.query('SELECT id, nombre FROM sst.categorias')
    const catId = Object.fromEntries(cats.map((c) => [c.nombre, c.id]))

    // ── Capacitaciones ───────────────────────────────────────────────────────
    const capacitaciones = [
      {
        titulo: 'Trabajo en Alturas Nivel I',
        descripcion: 'Fundamentos del trabajo seguro en alturas según resolución 4272 de 2021. Incluye EPP, sistemas de protección y procedimientos de emergencia.',
        categoria: 'Seguridad en el Trabajo',
        vigencia: '2027-06-01',
      },
      {
        titulo: 'Primeros Auxilios Básicos',
        descripcion: 'Técnicas de primeros auxilios: RCP, manejo de heridas, atención de quemaduras y protocolos de activación de emergencias.',
        categoria: 'Salud Ocupacional',
        vigencia: '2027-03-15',
      },
      {
        titulo: 'Manejo Seguro de Productos Químicos',
        descripcion: 'Identificación de sustancias peligrosas, uso de SDS, EPP específico y manejo de derrames. Norma GHS/SGA.',
        categoria: 'Manejo de Equipos',
        vigencia: '2026-12-31',
      },
      {
        titulo: 'Brigada de Emergencias y Evacuación',
        descripcion: 'Procedimientos de evacuación, uso de extintores, roles de la brigada y simulacros. Decreto 2393.',
        categoria: 'Emergencias y Evacuación',
        vigencia: '2026-11-01',
      },
      {
        titulo: 'Normatividad SST Colombia',
        descripcion: 'Decreto 1072 de 2015 (Libro 2 Parte 2 Título 4 Capítulo 6), Resolución 0312 y estándares mínimos del SG-SST.',
        categoria: 'Normatividad SST',
        vigencia: '2027-08-30',
      },
      {
        titulo: 'Ergonomía Laboral Avanzada',
        descripcion: 'Factores de riesgo ergonómico, pausas activas, adecuación del puesto de trabajo y prevención de lesiones osteomusculares.',
        categoria: 'Salud Ocupacional',
        vigencia: '2027-05-20',
      },
    ]

    const capIds = {}
    for (const c of capacitaciones) {
      const { rows } = await client.query(
        `INSERT INTO sst.capacitaciones (titulo, descripcion, categoria_id, creado_por, fecha_inicio, fecha_vigencia)
         VALUES ($1,$2,$3,$4,CURRENT_DATE,$5) RETURNING id`,
        [c.titulo, c.descripcion, catId[c.categoria], adminId, c.vigencia],
      )
      capIds[c.titulo] = rows[0].id
    }
    console.log(`  ✓ ${capacitaciones.length} capacitaciones creadas`)

    // ── Evaluaciones + Preguntas + Opciones ──────────────────────────────────
    const evaluacionesData = [
      {
        cap: 'Trabajo en Alturas Nivel I',
        titulo: 'Evaluación Trabajo en Alturas',
        preguntas: [
          { enunciado: '¿Cuál es la altura mínima desde la que se requiere protección contra caídas según la norma colombiana?', opciones: [{ texto: '1.5 metros', ok: false }, { texto: '1.8 metros', ok: true }, { texto: '2.0 metros', ok: false }, { texto: '1.2 metros', ok: false }] },
          { enunciado: '¿Qué elemento del EPP es indispensable para trabajo en alturas?', opciones: [{ texto: 'Casco de seguridad únicamente', ok: false }, { texto: 'Arnés de cuerpo completo', ok: true }, { texto: 'Guantes de cuero', ok: false }, { texto: 'Botas con puntera', ok: false }] },
          { enunciado: '¿Qué debe hacerse antes de iniciar un trabajo en alturas?', opciones: [{ texto: 'Iniciar el trabajo sin planificación', ok: false }, { texto: 'Verificar que el área esté despejada', ok: false }, { texto: 'Realizar un permiso de trabajo y análisis de riesgos', ok: true }, { texto: 'Usar el equipo más cercano disponible', ok: false }] },
          { enunciado: '¿Cuándo debe ser reemplazado un arnés de seguridad?', opciones: [{ texto: 'Cada 10 años sin importar el estado', ok: false }, { texto: 'Solo cuando se rompe visiblemente', ok: false }, { texto: 'Después de una caída o impacto de carga', ok: true }, { texto: 'Solo cuando lo indique el fabricante por antigüedad', ok: false }] },
          { enunciado: '¿Qué es un sistema de línea de vida horizontal?', opciones: [{ texto: 'Una cuerda que se coloca verticalmente en la estructura', ok: false }, { texto: 'Un cable o cuerda tensado horizontalmente para desplazamiento seguro en altura', ok: true }, { texto: 'Un sistema de descenso de emergencia', ok: false }, { texto: 'Una plataforma de trabajo elevada', ok: false }] },
        ],
      },
      {
        cap: 'Primeros Auxilios Básicos',
        titulo: 'Evaluación Primeros Auxilios',
        preguntas: [
          { enunciado: '¿Cuál es la frecuencia correcta de compresiones en la RCP para adultos?', opciones: [{ texto: '60-80 por minuto', ok: false }, { texto: '100-120 por minuto', ok: true }, { texto: '40-60 por minuto', ok: false }, { texto: '130-150 por minuto', ok: false }] },
          { enunciado: 'Ante una quemadura leve, ¿cuál es el primer paso?', opciones: [{ texto: 'Aplicar hielo directamente', ok: false }, { texto: 'Reventar las ampollas formadas', ok: false }, { texto: 'Enfriar con agua fría corriente por 10-20 minutos', ok: true }, { texto: 'Cubrir con crema hidratante', ok: false }] },
          { enunciado: '¿Qué significa el acrónimo RICE para lesiones musculares?', opciones: [{ texto: 'Reposo, Inmovilización, Calor, Ejercicio', ok: false }, { texto: 'Reposo, Hielo (Ice), Compresión, Elevación', ok: true }, { texto: 'Recuperación, Inmovilización, Circulación, Estabilización', ok: false }, { texto: 'Revisión, Intervención, Cirugía, Evaluación', ok: false }] },
          { enunciado: '¿Cuándo NO se debe retirar un objeto incrustado en el cuerpo?', opciones: [{ texto: 'Cuando es superficial', ok: false }, { texto: 'Siempre se debe retirar inmediatamente', ok: false }, { texto: 'Cuando está profundamente incrustado y puede causar más daño al retirarlo', ok: true }, { texto: 'Solo en heridas de menos de 2 cm', ok: false }] },
          { enunciado: '¿Qué posición se usa para un paciente inconsciente que respira?', opciones: [{ texto: 'Posición decúbito supino (boca arriba)', ok: false }, { texto: 'Posición de recuperación o lateral de seguridad', ok: true }, { texto: 'Posición sentada con cabeza entre las rodillas', ok: false }, { texto: 'Posición de trendelenburg', ok: false }] },
        ],
      },
      {
        cap: 'Manejo Seguro de Productos Químicos',
        titulo: 'Evaluación Productos Químicos',
        preguntas: [
          { enunciado: '¿Qué es una Hoja de Datos de Seguridad (SDS/MSDS)?', opciones: [{ texto: 'Un manual de usuario del producto', ok: false }, { texto: 'Un documento con información sobre peligros y manejo seguro de sustancias químicas', ok: true }, { texto: 'Una etiqueta de precio del producto', ok: false }, { texto: 'Un certificado de calidad del proveedor', ok: false }] },
          { enunciado: '¿Cuántas secciones tiene una SDS según GHS?', opciones: [{ texto: '8 secciones', ok: false }, { texto: '12 secciones', ok: false }, { texto: '16 secciones', ok: true }, { texto: '20 secciones', ok: false }] },
          { enunciado: '¿Qué símbolo de peligro GHS indica toxicidad aguda grave?', opciones: [{ texto: 'Llama', ok: false }, { texto: 'Calavera y tibias cruzadas', ok: true }, { texto: 'Signo de exclamación', ok: false }, { texto: 'Corrosión', ok: false }] },
          { enunciado: 'En caso de derrame de químico, ¿cuál es el primer paso?', opciones: [{ texto: 'Limpiar inmediatamente con trapo', ok: false }, { texto: 'Evacuar el área y notificar al responsable', ok: true }, { texto: 'Diluir con abundante agua', ok: false }, { texto: 'Cubrir con aserrín', ok: false }] },
          { enunciado: '¿Qué indica la categoría 1 de peligro en GHS?', opciones: [{ texto: 'El nivel de peligro más bajo', ok: false }, { texto: 'El nivel de peligro más alto', ok: true }, { texto: 'Una categoría intermedia', ok: false }, { texto: 'Que el producto no es peligroso', ok: false }] },
        ],
      },
    ]

    for (const ev of evaluacionesData) {
      const { rows: evRow } = await client.query(
        `INSERT INTO sst.evaluaciones (capacitacion_id, titulo, puntaje_minimo, max_intentos)
         VALUES ($1,$2,70,3) RETURNING id`,
        [capIds[ev.cap], ev.titulo],
      )
      const evId = evRow[0].id

      for (let pi = 0; pi < ev.preguntas.length; pi++) {
        const p = ev.preguntas[pi]
        const { rows: pRow } = await client.query(
          `INSERT INTO sst.preguntas (evaluacion_id, enunciado, orden) VALUES ($1,$2,$3) RETURNING id`,
          [evId, p.enunciado, pi + 1],
        )
        const pId = pRow[0].id

        for (let oi = 0; oi < p.opciones.length; oi++) {
          await client.query(
            `INSERT INTO sst.opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES ($1,$2,$3,$4)`,
            [pId, p.opciones[oi].texto, p.opciones[oi].ok, oi + 1],
          )
        }
      }
    }
    console.log(`  ✓ ${evaluacionesData.length} evaluaciones con preguntas y opciones creadas`)

    // ── Intentos de evaluación (algunos aprobados) ───────────────────────────
    const { rows: evList } = await client.query('SELECT id FROM sst.evaluaciones')

    const funcUsers = ['carlos@empresa.com', 'diana@empresa.com', 'luisa@empresa.com']
    for (const email of funcUsers) {
      const uid = userIds[email]
      const ev = evList[0]
      const { rows: intentoRow } = await client.query(
        `INSERT INTO sst.intentos_evaluacion (usuario_id, evaluacion_id, puntaje, aprobado, numero_intento, fecha_inicio, fecha_fin)
         VALUES ($1,$2,80,true,1,NOW()-INTERVAL '5 days',NOW()-INTERVAL '5 days'+INTERVAL '30 minutes') RETURNING id`,
        [uid, ev.id],
      )
      // Certificado automático por aprobación
      const capId = capIds['Trabajo en Alturas Nivel I']
      await client.query(
        `INSERT INTO sst.certificados (usuario_id, capacitacion_id, intento_id, fecha_emision)
         VALUES ($1,$2,$3,NOW()-INTERVAL '4 days')
         ON CONFLICT (usuario_id, capacitacion_id) DO NOTHING`,
        [uid, capId, intentoRow[0].id],
      )
    }

    // Carlos también aprobó Primeros Auxilios
    const carlosId = userIds['carlos@empresa.com']
    const ev2 = evList[1]
    if (ev2) {
      const { rows: i2 } = await client.query(
        `INSERT INTO sst.intentos_evaluacion (usuario_id, evaluacion_id, puntaje, aprobado, numero_intento, fecha_inicio, fecha_fin)
         VALUES ($1,$2,92,true,1,NOW()-INTERVAL '10 days',NOW()-INTERVAL '10 days'+INTERVAL '25 minutes') RETURNING id`,
        [carlosId, ev2.id],
      )
      await client.query(
        `INSERT INTO sst.certificados (usuario_id, capacitacion_id, intento_id, fecha_emision)
         VALUES ($1,$2,$3,NOW()-INTERVAL '9 days')
         ON CONFLICT DO NOTHING`,
        [carlosId, capIds['Primeros Auxilios Básicos'], i2[0].id],
      )
    }
    console.log('  ✓ Intentos y certificados de prueba creados')

    // ── Refrescar vista materializada ────────────────────────────────────────
    await client.query('REFRESH MATERIALIZED VIEW sst.mv_seguimiento_capacitacion')
    console.log('  ✓ Vista mv_seguimiento_capacitacion refrescada')

    await client.query('COMMIT')
    console.log('\n✅ Semilla completada exitosamente\n')
    console.log('Usuarios disponibles:')
    console.log('  admin@sst.local       → Admin1234!  (SUPER_USUARIO)')
    console.log('  maria@empresa.com     → Admin1234!  (ADMIN)')
    console.log('  paola@empresa.com     → Usuario123! (ADMIN)')
    console.log('  carlos@empresa.com    → Usuario123! (FUNCIONARIO)')
    console.log('  diana@empresa.com     → Usuario123! (FUNCIONARIO)')
    console.log('  luisa@empresa.com     → Usuario123! (FUNCIONARIO)')
    console.log('  jorge@empresa.com     → Usuario123! (FUNCIONARIO)')
    console.log('  andres@empresa.com    → Usuario123! (FUNCIONARIO)\n')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('❌ Error en semilla:', err.message)
    throw err
  } finally {
    client.release()
    await pool.end()
  }
}

seed().catch((e) => {
  console.error(e)
  process.exit(1)
})
