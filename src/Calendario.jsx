import { useMemo, useState } from 'react'

const DIAS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const HORAS = ['09:00', '10:00', '11:00', '12:00', '16:00', '17:00', '18:00', '19:00']

const claveDia = (d) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`

// Huecos de ejemplo: determinista por fecha para que no cambien al re-renderizar
function huecosDe(fecha) {
  const semilla = fecha.getFullYear() * 372 + fecha.getMonth() * 31 + fecha.getDate()
  return HORAS.filter((_, i) => (semilla * (i + 3)) % 5 !== 0)
}

export default function Calendario() {
  const hoy = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])
  const [mes, setMes] = useState(new Date(hoy.getFullYear(), hoy.getMonth(), 1))
  const [dia, setDia] = useState(null)
  const [hora, setHora] = useState(null)
  const [confirmada, setConfirmada] = useState(false)

  const titulo = mes.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
  const offset = (mes.getDay() + 6) % 7 // lunes como primer día
  const diasEnMes = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate()
  const esMesActual = mes.getFullYear() === hoy.getFullYear() && mes.getMonth() === hoy.getMonth()

  const celdas = [
    ...Array(offset).fill(null),
    ...Array.from({ length: diasEnMes }, (_, i) => new Date(mes.getFullYear(), mes.getMonth(), i + 1)),
  ]

  const disponible = (d) => d >= hoy && d.getDay() !== 0 // sin domingos
  const huecos = dia ? huecosDe(dia) : []

  const cambiarMes = (n) => {
    setMes(new Date(mes.getFullYear(), mes.getMonth() + n, 1))
    setDia(null)
    setHora(null)
  }

  const reiniciar = () => {
    setDia(null)
    setHora(null)
    setConfirmada(false)
  }

  return (
    <section id="calendario" className="mx-auto max-w-6xl px-5 py-20">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-gold-500">Reserva online</p>
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
            {celdas.map((d, i) =>
              d === null ? (
                <div key={`v${i}`} />
              ) : (
                <button
                  key={claveDia(d)}
                  disabled={!disponible(d)}
                  onClick={() => { setDia(d); setHora(null); setConfirmada(false) }}
                  className={[
                    'aspect-square rounded-full text-sm transition',
                    dia && claveDia(dia) === claveDia(d)
                      ? 'bg-night-600 font-semibold text-white'
                      : disponible(d)
                        ? 'text-night-900 hover:bg-night-100'
                        : 'cursor-not-allowed text-night-700/25',
                    claveDia(d) === claveDia(hoy) && !(dia && claveDia(dia) === claveDia(d)) ? 'ring-1 ring-night-500' : '',
                  ].join(' ')}
                >
                  {d.getDate()}
                </button>
              )
            )}
          </div>
        </div>

        {/* Horas / confirmación */}
        <div className="flex flex-col">
          {confirmada ? (
            <div className="flex flex-1 flex-col items-center justify-center rounded-2xl bg-night-100 p-8 text-center">
              <p className="text-4xl">✅</p>
              <p className="mt-3 font-serif text-xl font-semibold">¡Cita reservada!</p>
              <p className="mt-2 text-night-700">
                {dia.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })} a las {hora}
              </p>
              <button onClick={reiniciar} className="mt-6 text-sm font-semibold text-night-700 underline">
                Reservar otra
              </button>
            </div>
          ) : dia ? (
            <>
              <h3 className="mb-4 font-serif text-lg font-semibold capitalize">
                {dia.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {huecos.map((h) => (
                  <button
                    key={h}
                    onClick={() => setHora(h)}
                    className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                      hora === h
                        ? 'border-night-600 bg-night-600 text-white'
                        : 'border-night-200 text-night-700 hover:border-night-600'
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
              <button
                disabled={!hora}
                onClick={() => setConfirmada(true)}
                className="mt-auto rounded-full bg-night-600 px-6 py-3 font-semibold text-white transition hover:bg-night-700 disabled:cursor-not-allowed disabled:opacity-40 max-md:mt-6"
              >
                Confirmar cita
              </button>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-night-200 p-8 text-center text-night-700/70">
              Selecciona un día para ver las horas disponibles
            </div>
          )}
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-night-700/60">Disponibilidad de ejemplo · demo</p>
    </section>
  )
}
