import { useCallback, useEffect, useMemo, useState } from 'react'
import { api, HORAS, toISO } from './api.js'

const DIAS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const campo =
  'mt-1 w-full rounded-xl border border-night-200 px-4 py-3 text-sm outline-none focus:border-night-600 focus:ring-2 focus:ring-night-200'

export default function Calendario() {
  const hoy = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])
  const [mes, setMes] = useState(new Date(hoy.getFullYear(), hoy.getMonth(), 1))
  const [dia, setDia] = useState(null)
  const [hora, setHora] = useState(null)
  const [ocupadas, setOcupadas] = useState({})
  const [sinConexion, setSinConexion] = useState(false)
  const [form, setForm] = useState({ nombre: '', contacto: '', nota: '', web: '' })
  const [estado, setEstado] = useState('idle') // idle | enviando | ok
  const [error, setError] = useState('')

  const cargar = useCallback(async () => {
    const ym = `${mes.getFullYear()}-${String(mes.getMonth() + 1).padStart(2, '0')}`
    try {
      const { taken } = await api(`/api/availability?month=${ym}`)
      setOcupadas(taken)
      setSinConexion(false)
    } catch {
      setSinConexion(true)
    }
  }, [mes])

  useEffect(() => {
    cargar()
  }, [cargar])

  const titulo = mes.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
  const offset = (mes.getDay() + 6) % 7 // lunes primero
  const diasEnMes = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate()
  const esMesActual = mes.getFullYear() === hoy.getFullYear() && mes.getMonth() === hoy.getMonth()
  const celdas = [
    ...Array(offset).fill(null),
    ...Array.from({ length: diasEnMes }, (_, i) => new Date(mes.getFullYear(), mes.getMonth(), i + 1)),
  ]

  const disponible = (d) => d >= hoy && d.getDay() !== 0
  const diaISO = dia && toISO(dia)
  const huecos = dia
    ? HORAS.filter((h) => {
        if ((ocupadas[diaISO] || []).includes(h)) return false
        if (toISO(dia) === toISO(hoy)) return Number(h.slice(0, 2)) > new Date().getHours()
        return true
      })
    : []

  const cambiarMes = (n) => {
    setMes(new Date(mes.getFullYear(), mes.getMonth() + n, 1))
    setDia(null)
    setHora(null)
  }

  const reiniciar = () => {
    setDia(null)
    setHora(null)
    setError('')
    setEstado('idle')
    setForm({ nombre: '', contacto: '', nota: '', web: '' })
  }

  async function enviar(e) {
    e.preventDefault()
    setError('')
    setEstado('enviando')
    try {
      await api('/api/bookings', { method: 'POST', body: { ...form, fecha: diaISO, hora } })
      setEstado('ok')
      cargar()
    } catch (err) {
      setEstado('idle')
      setError(err.message)
      if (err.status === 409) {
        setHora(null)
        cargar()
      }
    }
  }

  const fechaLarga = dia?.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <section id="calendario" className="mx-auto max-w-6xl scroll-mt-16 px-5 py-20">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-gold-500">✦ Reserva online ✦</p>
        <h2 className="font-serif text-3xl font-semibold sm:text-4xl">Elige el día y la hora que mejor te vengan</h2>
      </div>

      <div className="mx-auto grid max-w-4xl gap-8 rounded-3xl border border-night-100 bg-white p-6 shadow-sm md:grid-cols-2 md:p-8">
        {/* Calendario */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={() => cambiarMes(-1)}
              disabled={esMesActual}
              aria-label="Mes anterior"
              className="rounded-full p-2 text-night-700 hover:bg-night-100 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              ←
            </button>
            <h3 className="font-serif text-lg font-semibold capitalize">{titulo}</h3>
            <button onClick={() => cambiarMes(1)} aria-label="Mes siguiente" className="rounded-full p-2 text-night-700 hover:bg-night-100">
              →
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-night-700/60">
            {DIAS.map((d) => <div key={d} className="py-2">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {celdas.map((d, i) => {
              if (d === null) return <div key={`v${i}`} />
              const sel = dia && toISO(dia) === toISO(d)
              const llenos = (ocupadas[toISO(d)] || []).length >= HORAS.length
              const ok = disponible(d) && !llenos
              return (
                <button
                  key={toISO(d)}
                  disabled={!ok}
                  onClick={() => { setDia(d); setHora(null); setError(''); setEstado('idle') }}
                  className={[
                    'aspect-square rounded-full text-sm transition',
                    sel ? 'bg-night-600 font-semibold text-white' : ok ? 'text-night-900 hover:bg-night-100' : 'cursor-not-allowed text-night-700/25',
                    toISO(d) === toISO(hoy) && !sel ? 'ring-1 ring-gold-500' : '',
                  ].join(' ')}
                >
                  {d.getDate()}
                </button>
              )
            })}
          </div>
          {sinConexion && (
            <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
              No pudimos cargar la disponibilidad. Revisa tu conexión e inténtalo de nuevo.
            </p>
          )}
        </div>

        {/* Horas / datos / confirmación */}
        <div className="flex flex-col">
          {estado === 'ok' ? (
            <div className="flex flex-1 flex-col items-center justify-center rounded-2xl bg-night-700 p-8 text-center text-white">
              <p className="text-4xl text-gold-300">✦</p>
              <p className="mt-3 font-serif text-xl font-semibold">¡Solicitud enviada!</p>
              <p className="mt-2 capitalize text-night-100">{fechaLarga} · {hora}</p>
              <p className="mt-3 text-sm text-night-200">Te contactaremos para confirmar tu cita.</p>
              <button onClick={reiniciar} className="mt-6 text-sm font-semibold text-gold-300 underline">
                Reservar otra
              </button>
            </div>
          ) : dia ? (
            <form onSubmit={enviar} className="flex flex-1 flex-col gap-4">
              <h3 className="font-serif text-lg font-semibold capitalize">{fechaLarga}</h3>
              {huecos.length === 0 ? (
                <p className="rounded-xl bg-night-50 p-4 text-sm text-night-700">No quedan horarios este día. Prueba con otro.</p>
              ) : (
                <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Hora">
                  {huecos.map((h) => (
                    <button
                      type="button"
                      key={h}
                      role="radio"
                      aria-checked={hora === h}
                      onClick={() => setHora(h)}
                      className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                        hora === h ? 'border-night-600 bg-night-600 text-white' : 'border-night-200 text-night-700 hover:border-night-600'
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              )}

              {hora && (
                <>
                  <label className="text-sm font-medium">
                    Nombre
                    <input required minLength={2} maxLength={80} autoComplete="name" value={form.nombre}
                      onChange={(e) => setForm({ ...form, nombre: e.target.value })} className={campo} />
                  </label>
                  <label className="text-sm font-medium">
                    Email o WhatsApp
                    <input required minLength={3} maxLength={120} autoComplete="email" value={form.contacto}
                      onChange={(e) => setForm({ ...form, contacto: e.target.value })} className={campo} />
                  </label>
                  <label className="text-sm font-medium">
                    ¿Qué te gustaría trabajar? <span className="text-night-700/50">(opcional)</span>
                    <textarea rows="2" maxLength={500} value={form.nota}
                      onChange={(e) => setForm({ ...form, nota: e.target.value })} className={campo} />
                  </label>
                  {/* Campo trampa para bots: las personas no lo ven */}
                  <input tabIndex={-1} autoComplete="off" aria-hidden="true" value={form.web}
                    onChange={(e) => setForm({ ...form, web: e.target.value })}
                    className="absolute -left-[9999px] h-0 w-0 opacity-0" />
                </>
              )}

              {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

              <button
                disabled={!hora || estado === 'enviando'}
                className="mt-auto rounded-full bg-night-600 px-6 py-3 font-semibold text-white transition hover:bg-night-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {estado === 'enviando' ? 'Enviando…' : 'Solicitar cita'}
              </button>
            </form>
          ) : (
            <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-night-200 p-8 text-center text-night-700/70">
              Selecciona un día para ver las horas disponibles
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
