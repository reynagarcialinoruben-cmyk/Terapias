import express from 'express'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

const PORT = Number(process.env.PORT) || 3001
const DATA_FILE = process.env.DATA_FILE || './data/bookings.json'
const { ADMIN_USER, ADMIN_PASSWORD, TOKEN_SECRET } = process.env
const TZ = 'America/Monterrey'
const TOKEN_TTL_MS = 8 * 60 * 60 * 1000 // 8 horas

if (!ADMIN_USER || !ADMIN_PASSWORD || !TOKEN_SECRET) {
  console.error('Faltan variables: ADMIN_USER, ADMIN_PASSWORD y TOKEN_SECRET son obligatorias.')
  process.exit(1)
}
if (TOKEN_SECRET.length < 32) {
  console.error('TOKEN_SECRET debe tener al menos 32 caracteres.')
  process.exit(1)
}

// Mismas horas que el calendario del frontend
const HORAS = ['09:00', '10:00', '11:00', '12:00', '16:00', '17:00', '18:00', '19:00']
const ESTADOS = ['pendiente', 'confirmada', 'cancelada']

/* ---------- Almacenamiento (archivo JSON, escritura atómica) ---------- */
fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true })
let bookings = []
try {
  bookings = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
} catch (e) {
  if (e.code !== 'ENOENT') throw e
}
function save() {
  const tmp = `${DATA_FILE}.tmp`
  fs.writeFileSync(tmp, JSON.stringify(bookings, null, 2))
  fs.renameSync(tmp, DATA_FILE)
}

/* ---------- Utilidades ---------- */
const hoyISO = () => new Date().toLocaleDateString('en-CA', { timeZone: TZ })

function fechaValida(s) {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null
  const [y, m, d] = s.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null
  return dt
}

const sha = (v) => crypto.createHash('sha256').update(String(v)).digest()
const igual = (a, b) => crypto.timingSafeEqual(sha(a), sha(b))

function firmar(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = crypto.createHmac('sha256', TOKEN_SECRET).update(body).digest('base64url')
  return `${body}.${sig}`
}
function verificar(token) {
  if (typeof token !== 'string') return null
  const [body, sig] = token.split('.')
  if (!body || !sig) return null
  const esperada = crypto.createHmac('sha256', TOKEN_SECRET).update(body).digest('base64url')
  const a = Buffer.from(sig)
  const b = Buffer.from(esperada)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null
  try {
    const p = JSON.parse(Buffer.from(body, 'base64url').toString())
    return p.exp > Date.now() ? p : null
  } catch {
    return null
  }
}

/* Limitador simple en memoria: máx. `max` intentos por IP cada `ventanaMs` */
function limitador(max, ventanaMs) {
  const usos = new Map()
  return (req, res, next) => {
    const ahora = Date.now()
    const u = usos.get(req.ip)
    if (!u || u.reinicio < ahora) {
      usos.set(req.ip, { n: 1, reinicio: ahora + ventanaMs })
      return next()
    }
    if (++u.n > max) {
      res.set('Retry-After', Math.ceil((u.reinicio - ahora) / 1000))
      return res.status(429).json({ error: 'Demasiados intentos. Inténtalo más tarde.' })
    }
    next()
  }
}

function requiereAdmin(req, res, next) {
  const token = (req.get('authorization') || '').replace(/^Bearer /, '')
  if (!verificar(token)) return res.status(401).json({ error: 'No autorizado' })
  next()
}

/* ---------- App ---------- */
const app = express()
app.set('trust proxy', 1)
app.disable('x-powered-by')
app.use(express.json({ limit: '10kb' }))
app.use((req, res, next) => {
  res.set({ 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' })
  next()
})

// Horas ocupadas de un mes (solo fecha y hora, sin datos personales)
app.get('/api/availability', (req, res) => {
  const month = String(req.query.month || '')
  if (!/^\d{4}-\d{2}$/.test(month)) return res.status(400).json({ error: 'month inválido (YYYY-MM)' })
  const taken = {}
  for (const b of bookings) {
    if (b.estado !== 'cancelada' && b.fecha.startsWith(month)) (taken[b.fecha] ||= []).push(b.hora)
  }
  res.json({ taken })
})

// Crear reserva (pública)
app.post('/api/bookings', limitador(10, 60 * 60 * 1000), (req, res) => {
  const { nombre, contacto, nota = '', fecha, hora, web } = req.body || {}
  if (web) return res.status(201).json({ ok: true }) // honeypot: los bots lo rellenan

  const n = typeof nombre === 'string' ? nombre.trim() : ''
  const c = typeof contacto === 'string' ? contacto.trim() : ''
  const t = typeof nota === 'string' ? nota.trim() : ''
  if (n.length < 2 || n.length > 80) return res.status(400).json({ error: 'Nombre inválido' })
  if (c.length < 3 || c.length > 120) return res.status(400).json({ error: 'Contacto inválido' })
  if (t.length > 500) return res.status(400).json({ error: 'La nota es demasiado larga' })

  const dt = fechaValida(fecha)
  if (!dt) return res.status(400).json({ error: 'Fecha inválida' })
  if (fecha < hoyISO()) return res.status(400).json({ error: 'La fecha ya pasó' })
  if (dt.getUTCDay() === 0) return res.status(400).json({ error: 'No hay citas los domingos' })
  if (!HORAS.includes(hora)) return res.status(400).json({ error: 'Hora inválida' })

  if (bookings.some((b) => b.fecha === fecha && b.hora === hora && b.estado !== 'cancelada')) {
    return res.status(409).json({ error: 'Ese horario ya fue reservado. Elige otro.' })
  }

  const booking = {
    id: crypto.randomUUID(),
    nombre: n,
    contacto: c,
    nota: t,
    fecha,
    hora,
    estado: 'pendiente',
    creada: new Date().toISOString(),
  }
  bookings.push(booking)
  save()
  res.status(201).json({ ok: true, id: booking.id })
})

// Login de administrador
app.post('/api/admin/login', limitador(5, 15 * 60 * 1000), (req, res) => {
  const { usuario, password } = req.body || {}
  const okUser = typeof usuario === 'string' && igual(usuario, ADMIN_USER)
  const okPass = typeof password === 'string' && igual(password, ADMIN_PASSWORD)
  if (!okUser || !okPass) return res.status(401).json({ error: 'Usuario o contraseña incorrectos' })
  res.json({ token: firmar({ u: usuario, exp: Date.now() + TOKEN_TTL_MS }) })
})

// Reservas (solo admin)
app.get('/api/admin/bookings', requiereAdmin, (req, res) => {
  const lista = [...bookings].sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora))
  res.json({ bookings: lista })
})

app.patch('/api/admin/bookings/:id', requiereAdmin, (req, res) => {
  const b = bookings.find((x) => x.id === req.params.id)
  if (!b) return res.status(404).json({ error: 'No encontrada' })
  const { estado } = req.body || {}
  if (!ESTADOS.includes(estado)) return res.status(400).json({ error: 'Estado inválido' })
  b.estado = estado
  save()
  res.json({ booking: b })
})

app.delete('/api/admin/bookings/:id', requiereAdmin, (req, res) => {
  const i = bookings.findIndex((x) => x.id === req.params.id)
  if (i === -1) return res.status(404).json({ error: 'No encontrada' })
  bookings.splice(i, 1)
  save()
  res.json({ ok: true })
})

app.use('/api', (req, res) => res.status(404).json({ error: 'No encontrado' }))
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON inválido' })
  console.error(err)
  res.status(500).json({ error: 'Error del servidor' })
})

app.listen(PORT, () => console.log(`API escuchando en :${PORT}`))
