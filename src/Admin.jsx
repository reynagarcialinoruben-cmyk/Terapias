import { useCallback, useEffect, useMemo, useState } from 'react'
import { api, fromISO, toISO } from './api.js'

const TOKEN_KEY = 'admin_token'
const leer = () => { try { return sessionStorage.getItem(TOKEN_KEY) } catch { return null } }
const guardar = (t) => { try { t ? sessionStorage.setItem(TOKEN_KEY, t) : sessionStorage.removeItem(TOKEN_KEY) } catch { /* sin almacenamiento */ } }

const ESTILO_ESTADO = {
  pendiente: 'bg-amber-100 text-amber-800',
  confirmada: 'bg-emerald-100 text-emerald-800',
  cancelada: 'bg-night-100 text-night-700 line-through',
}

const fechaCorta = (iso) =>
  fromISO(iso).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })

// Evita que Excel interprete una celda como fórmula
const celdaCSV = (v) => {
  let s = String(v ?? '')
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
  return `"${s.replace(/"/g, '""')}"`
}

function exportarCSV(filas) {
  const cab = ['Fecha', 'Hora', 'Nombre', 'Contacto', 'Estado', 'Nota', 'Creada']
  const lineas = filas.map((b) => [b.fecha, b.hora, b.nombre, b.contacto, b.estado, b.nota, b.creada].map(celdaCSV).join(','))
  const blob = new Blob(['﻿' + [cab.join(','), ...lineas].join('\n')], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `citas-${toISO(new Date())}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}

function Login({ onLogin }) {
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  async function enviar(e) {
    e.preventDefault()
    setError('')
    setCargando(true)
    try {
      const { token } = await api('/api/admin/login', { method: 'POST', body: { usuario, password } })
      guardar(token)
      onLogin(token)
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  const campo = 'mt-1 w-full rounded-xl border border-night-200 px-4 py-3 outline-none focus:border-night-600 focus:ring-2 focus:ring-night-200'
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-night-900 to-night-700 px-5">
      <form onSubmit={enviar} className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl">
        <p className="text-center text-2xl text-gold-500">✦</p>
        <h1 className="mt-1 text-center font-serif text-2xl font-semibold">Panel de administración</h1>
        <p className="mb-6 text-center text-sm text-night-700/70">Leticia Murguía · Constelaciones</p>
        <label className="block text-sm font-medium">
          Usuario
          <input required autoFocus autoComplete="username" value={usuario} onChange={(e) => setUsuario(e.target.value)} className={campo} />
        </label>
        <label className="mt-4 block text-sm font-medium">
          Contraseña
          <input required type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={campo} />
        </label>
        {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <button disabled={cargando} className="mt-6 w-full rounded-full bg-night-600 px-6 py-3 font-semibold text-white transition hover:bg-night-700 disabled:opacity-50">
          {cargando ? 'Entrando…' : 'Entrar'}
        </button>
        <a href="/" className="mt-4 block text-center text-sm text-night-500 hover:underline">← Volver al sitio</a>
      </form>
    </main>
  )
}

function Stat({ etiqueta, valor }) {
  return (
    <div className="rounded-2xl border border-night-100 bg-white p-5">
      <p className="text-sm text-night-700/70">{etiqueta}</p>
      <p className="mt-1 font-serif text-3xl font-semibold text-night-700">{valor}</p>
    </div>
  )
}

function Panel({ token, onSalir }) {
  const [citas, setCitas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [filtro, setFiltro] = useState('todas')
  const [busqueda, setBusqueda] = useState('')
  const [soloProximas, setSoloProximas] = useState(true)

  const manejar = useCallback((err) => {
    if (err.status === 401) onSalir()
    else setError(err.message)
  }, [onSalir])

  const cargar = useCallback(async () => {
    setCargando(true)
    setError('')
    try {
      const { bookings } = await api('/api/admin/bookings', { token })
      setCitas(bookings)
    } catch (err) {
      manejar(err)
    } finally {
      setCargando(false)
    }
  }, [token, manejar])

  useEffect(() => { cargar() }, [cargar])

  async function cambiar(id, estado) {
    try {
      const { booking } = await api(`/api/admin/bookings/${id}`, { method: 'PATCH', token, body: { estado } })
      setCitas((l) => l.map((c) => (c.id === id ? booking : c)))
    } catch (err) { manejar(err) }
  }

  async function eliminar(c) {
    if (!window.confirm(`¿Eliminar definitivamente la cita de ${c.nombre}?`)) return
    try {
      await api(`/api/admin/bookings/${c.id}`, { method: 'DELETE', token })
      setCitas((l) => l.filter((x) => x.id !== c.id))
    } catch (err) { manejar(err) }
  }

  const hoy = toISO(new Date())
  const stats = useMemo(() => ({
    total: citas.length,
    pendientes: citas.filter((c) => c.estado === 'pendiente').length,
    hoy: citas.filter((c) => c.fecha === hoy && c.estado !== 'cancelada').length,
    proximas: citas.filter((c) => c.fecha >= hoy && c.estado !== 'cancelada').length,
  }), [citas, hoy])

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return citas.filter((c) =>
      (filtro === 'todas' || c.estado === filtro) &&
      (!soloProximas || c.fecha >= hoy) &&
      (!q || `${c.nombre} ${c.contacto} ${c.nota}`.toLowerCase().includes(q))
    )
  }, [citas, filtro, busqueda, soloProximas, hoy])

  return (
    <div className="min-h-screen bg-night-50">
      <header className="bg-night-900 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="leading-tight">
            <p className="font-serif text-lg font-semibold text-gold-300">✦ Panel de citas</p>
            <p className="text-[10px] uppercase tracking-[0.25em] text-night-200">Leticia Murguía</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <a href="/" className="text-night-200 hover:text-gold-300">Ver sitio</a>
            <button onClick={onSalir} className="rounded-full border border-gold-300/50 px-4 py-1.5 text-gold-300 hover:bg-white/10">Salir</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat etiqueta="Citas totales" valor={stats.total} />
          <Stat etiqueta="Por confirmar" valor={stats.pendientes} />
          <Stat etiqueta="Hoy" valor={stats.hoy} />
          <Stat etiqueta="Próximas" valor={stats.proximas} />
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <input
            type="search" placeholder="Buscar por nombre, contacto o nota…" value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="min-w-0 flex-1 rounded-full border border-night-200 bg-white px-5 py-2.5 text-sm outline-none focus:border-night-600 sm:flex-none sm:w-80"
          />
          <select value={filtro} onChange={(e) => setFiltro(e.target.value)} aria-label="Filtrar por estado"
            className="rounded-full border border-night-200 bg-white px-4 py-2.5 text-sm">
            <option value="todas">Todos los estados</option>
            <option value="pendiente">Pendientes</option>
            <option value="confirmada">Confirmadas</option>
            <option value="cancelada">Canceladas</option>
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={soloProximas} onChange={(e) => setSoloProximas(e.target.checked)} className="accent-night-600" />
            Solo próximas
          </label>
          <div className="ml-auto flex gap-2">
            <button onClick={cargar} className="rounded-full border border-night-200 bg-white px-4 py-2.5 text-sm hover:bg-night-100">Actualizar</button>
            <button onClick={() => exportarCSV(visibles)} disabled={!visibles.length}
              className="rounded-full bg-night-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-night-700 disabled:opacity-40">Exportar CSV</button>
          </div>
        </div>

        {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        <ul className="mt-6 space-y-3">
          {cargando && <li className="py-10 text-center text-night-700/60">Cargando…</li>}
          {!cargando && visibles.length === 0 && (
            <li className="rounded-2xl border border-dashed border-night-200 py-12 text-center text-night-700/60">
              {citas.length === 0 ? 'Todavía no hay citas registradas.' : 'Ninguna cita coincide con los filtros.'}
            </li>
          )}
          {visibles.map((c) => (
            <li key={c.id} className="grid gap-4 rounded-2xl border border-night-100 bg-white p-5 md:grid-cols-[11rem_1fr_auto] md:items-center">
              <div>
                <p className="font-serif text-lg font-semibold capitalize">{fechaCorta(c.fecha)}</p>
                <p className="text-night-700">{c.hora} h</p>
              </div>
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 font-medium">
                  {c.nombre}
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${ESTILO_ESTADO[c.estado]}`}>{c.estado}</span>
                </p>
                <p className="break-words text-sm text-night-700/80">{c.contacto}</p>
                {c.nota && <p className="mt-1 break-words text-sm italic text-night-700/70">“{c.nota}”</p>}
                <p className="mt-1 text-xs text-night-700/50">
                  Solicitada {new Date(c.creada).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {c.estado !== 'confirmada' && (
                  <button onClick={() => cambiar(c.id, 'confirmada')} className="rounded-full bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-700">Confirmar</button>
                )}
                {c.estado !== 'cancelada' && (
                  <button onClick={() => cambiar(c.id, 'cancelada')} className="rounded-full border border-night-200 px-4 py-1.5 text-sm hover:bg-night-100">Cancelar</button>
                )}
                <button onClick={() => eliminar(c)} className="rounded-full px-3 py-1.5 text-sm text-red-700 hover:bg-red-50">Eliminar</button>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}

export default function Admin() {
  const [token, setToken] = useState(leer)
  const salir = useCallback(() => { guardar(null); setToken(null) }, [])
  useEffect(() => { document.title = 'Panel · Leticia Murguía' }, [])
  return token ? <Panel token={token} onSalir={salir} /> : <Login onLogin={setToken} />
}
