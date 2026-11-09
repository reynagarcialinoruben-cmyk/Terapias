import { useState } from 'react'
import Calendario from './Calendario.jsx'

const FACEBOOK = 'https://www.facebook.com/leticiamurguiaconstelaciones'

const NAV = [
  ['Constelaciones', '#que-es'],
  ['Servicios', '#servicios'],
  ['Proceso', '#proceso'],
  ['Leticia', '#leticia'],
  ['Reserva', '#calendario'],
]

const SERVICIOS = [
  { icon: '✦', titulo: 'Constelación individual', texto: 'Una sesión a solas con Leticia para mirar con calma un tema concreto de tu historia familiar.' },
  { icon: '✧', titulo: 'Constelación en grupo', texto: 'Trabajo en círculo con otras personas, donde cada quien constela su tema y acompaña el de los demás.' },
  { icon: '☽', titulo: 'Transformación sistémica', texto: 'Procesos para ver cómo tus relaciones, tu trabajo y tu familia se influyen entre sí.' },
  { icon: '❖', titulo: 'Constelaciones online', texto: 'La misma sesión, con la misma calidez, por videollamada desde donde estés.' },
  { icon: '☀', titulo: 'Talleres y retiros', texto: 'Jornadas temáticas para profundizar: linaje, pareja, abundancia, duelo y más.' },
  { icon: '✺', titulo: 'Acompañamiento continuo', texto: 'Seguimiento entre sesiones para integrar lo que apareció y darle forma en tu día a día.' },
]

const PASOS = [
  { n: 'I', titulo: 'Cuéntanos tu tema', texto: 'Escríbenos qué te trae. Sin prisa y sin compromiso.' },
  { n: 'II', titulo: 'Elige tu sesión', texto: 'Individual o en grupo, presencial en Saltillo u online. Tú decides.' },
  { n: 'III', titulo: 'Constela', texto: 'Se coloca el tema en el espacio, se observa lo que aparece y se busca un movimiento hacia el orden.' },
  { n: 'IV', titulo: 'Integra', texto: 'Te llevas una imagen nueva de tu historia y los pasos para vivirla.' },
]

const OPINIONES = [
  { texto: 'Llegué con una pregunta que cargaba desde hace años. Salí con una imagen clara y mucha paz.', autor: 'Testimonio de ejemplo' },
  { texto: 'Un espacio muy respetuoso. Leticia acompaña con una calma que se contagia.', autor: 'Testimonio de ejemplo' },
  { texto: 'Pensé que no iba a sentir nada y terminé llorando y agradeciendo a mis abuelos.', autor: 'Testimonio de ejemplo' },
]

/* Constelación decorativa: puntos [x, y, tamaño, retraso] y líneas entre índices */
const ESTRELLAS = [
  [60, 210, 5, 0], [130, 140, 4, 0.6], [215, 170, 6, 1.2], [290, 95, 4, 0.3],
  [370, 150, 5, 1.8], [330, 250, 4, 0.9], [250, 300, 6, 2.4], [150, 320, 4, 1.5],
  [420, 60, 3, 2.1], [95, 60, 3, 0.4],
]
const LINEAS = [[0, 1], [1, 2], [2, 3], [3, 4], [2, 5], [5, 6], [6, 7], [7, 0], [4, 8], [1, 9]]

function Constelacion({ className = '' }) {
  return (
    <svg viewBox="0 0 480 380" className={className} aria-hidden="true">
      {LINEAS.map(([a, b], i) => (
        <line
          key={i}
          x1={ESTRELLAS[a][0]} y1={ESTRELLAS[a][1]} x2={ESTRELLAS[b][0]} y2={ESTRELLAS[b][1]}
          stroke="currentColor" strokeOpacity="0.35" strokeWidth="1"
        />
      ))}
      {ESTRELLAS.map(([x, y, r, d], i) => (
        <g key={i} className="animate-twinkle" style={{ animationDelay: `${d}s`, transformOrigin: `${x}px ${y}px` }}>
          <circle cx={x} cy={y} r={r * 2.6} fill="currentColor" opacity="0.12" />
          <circle cx={x} cy={y} r={r} fill="currentColor" />
        </g>
      ))}
    </svg>
  )
}

function Boton({ href, children, variante = 'primario' }) {
  const base = 'inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900'
  const estilos = {
    primario: 'bg-gold-500 text-night-900 hover:bg-gold-300',
    secundario: 'border border-gold-300/60 text-gold-300 hover:bg-white/10',
    oscuro: 'bg-night-600 text-white hover:bg-night-700',
  }
  return <a href={href} className={`${base} ${estilos[variante]}`}>{children}</a>
}

function Titulo({ etiqueta, children, claro = false }) {
  return (
    <div className="mx-auto mb-12 max-w-2xl text-center">
      <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-gold-500">✦ {etiqueta} ✦</p>
      <h2 className={`font-serif text-3xl font-semibold sm:text-4xl ${claro ? 'text-white' : ''}`}>{children}</h2>
    </div>
  )
}

function Header() {
  const [abierto, setAbierto] = useState(false)
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-night-900/90 text-white backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <a href="#" className="leading-tight">
          <span className="block font-serif text-lg font-semibold text-gold-300">Leticia Murguía</span>
          <span className="block text-[10px] uppercase tracking-[0.25em] text-night-200">Constelaciones · Saltillo</span>
        </a>
        <nav className="hidden items-center gap-7 lg:flex">
          {NAV.map(([t, h]) => (
            <a key={h} href={h} className="text-sm text-night-100 hover:text-gold-300">{t}</a>
          ))}
          <Boton href="#calendario">Reservar sesión</Boton>
        </nav>
        <button
          className="rounded p-2 text-gold-300 lg:hidden"
          aria-label="Abrir menú"
          aria-expanded={abierto}
          onClick={() => setAbierto(!abierto)}
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {abierto ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>
      {abierto && (
        <nav className="flex flex-col gap-4 border-t border-white/10 px-5 py-4 lg:hidden">
          {NAV.map(([t, h]) => (
            <a key={h} href={h} onClick={() => setAbierto(false)} className="text-night-100">{t}</a>
          ))}
          <Boton href="#calendario">Reservar sesión</Boton>
        </nav>
      )}
    </header>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-night-900 via-night-800 to-night-700 text-white">
      <div className="absolute -right-24 top-10 h-96 w-96 rounded-full bg-night-500/30 blur-3xl" aria-hidden />
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 py-20 md:grid-cols-2 md:py-28">
        <div>
          <p className="mb-5 text-sm uppercase tracking-[0.3em] text-gold-300">Transformación sistémica y constelaciones</p>
          <h1 className="font-serif text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
            Cada historia familiar es una <span className="italic text-gold-300">constelación</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg text-night-100/90">
            Un espacio para mirar tus raíces, ordenar lo que pesa y volver a tu lugar con más paz. Sesiones en Saltillo y online.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Boton href="#calendario">Reservar sesión</Boton>
            <Boton href="#que-es" variante="secundario">¿Qué es una constelación?</Boton>
          </div>
        </div>
        <div className="animate-drift text-gold-300">
          <Constelacion className="mx-auto w-full max-w-md" />
        </div>
      </div>
    </section>
  )
}

function QueEs() {
  const ideas = [
    ['Pertenencia', 'Todos necesitamos sentir que tenemos un lugar en nuestra familia.'],
    ['Orden', 'Cuando cada quien ocupa su lugar, las relaciones fluyen con menos tensión.'],
    ['Equilibrio', 'Dar y recibir en armonía sostiene los vínculos a lo largo del tiempo.'],
  ]
  return (
    <section id="que-es" className="mx-auto max-w-6xl px-5 py-20">
      <Titulo etiqueta="Constelaciones">Mirar el sistema para entender lo propio</Titulo>
      <p className="mx-auto mb-12 max-w-2xl text-center text-lg text-night-700/80">
        Las constelaciones familiares son un método de trabajo grupal e individual que observa a la persona dentro de su sistema: familia, pareja, trabajo. Se coloca un tema en el espacio y se explora lo que aparece.
      </p>
      <div className="grid gap-6 md:grid-cols-3">
        {ideas.map(([t, x]) => (
          <div key={t} className="rounded-3xl border border-night-100 bg-white p-8 text-center">
            <p className="mb-3 text-2xl text-gold-500">✦</p>
            <h3 className="mb-2 font-serif text-xl font-semibold">{t}</h3>
            <p className="text-night-700/80">{x}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function Servicios() {
  return (
    <section id="servicios" className="bg-night-50 py-20">
      <div className="mx-auto max-w-6xl px-5">
        <Titulo etiqueta="Servicios">Formas de acompañarte</Titulo>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICIOS.map((s) => (
            <article key={s.titulo} className="rounded-3xl border border-night-100 bg-white p-7 transition hover:-translate-y-1 hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-night-700 text-2xl text-gold-300">{s.icon}</div>
              <h3 className="mb-2 font-serif text-xl font-semibold">{s.titulo}</h3>
              <p className="text-night-700/80">{s.texto}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Proceso() {
  return (
    <section id="proceso" className="relative overflow-hidden bg-night-800 py-20 text-white">
      <Constelacion className="absolute -left-20 bottom-0 w-[28rem] text-gold-300 opacity-20" />
      <div className="relative mx-auto max-w-6xl px-5">
        <Titulo etiqueta="Proceso" claro>Así es el camino</Titulo>
        <ol className="grid gap-6 md:grid-cols-4">
          {PASOS.map((p) => (
            <li key={p.n} className="rounded-3xl border border-white/10 bg-white/5 p-7">
              <span className="mb-4 block font-serif text-3xl text-gold-300">{p.n}</span>
              <h3 className="mb-2 font-serif text-lg font-semibold">{p.titulo}</h3>
              <p className="text-sm text-night-100/90">{p.texto}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function Leticia() {
  return (
    <section id="leticia" className="mx-auto max-w-6xl px-5 py-20">
      <div className="grid items-center gap-12 md:grid-cols-5">
        <div className="md:col-span-2">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-xs overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-night-600 to-night-900 text-gold-300 shadow-xl">
            <Constelacion className="absolute inset-0 h-full w-full opacity-60" />
            <p className="absolute inset-x-0 bottom-6 text-center text-xs uppercase tracking-widest text-night-200">Tu foto aquí</p>
          </div>
        </div>
        <div className="md:col-span-3">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-gold-500">✦ Quién te acompaña ✦</p>
          <h2 className="mb-5 font-serif text-3xl font-semibold sm:text-4xl">Leticia Murguía</h2>
          <p className="mb-4 text-lg text-night-700/80">
            Facilitadora de constelaciones y transformación sistémica en Saltillo, Coahuila. Acompaña a personas y grupos a mirar su historia con respeto, sin juicios y a su propio ritmo.
          </p>
          <p className="mb-6 text-night-700/70">
            Aquí irá su biografía, formación y trayectoria. Texto de ejemplo para la demo.
          </p>
          <Boton href={FACEBOOK} variante="oscuro">Visitar su página de Facebook</Boton>
        </div>
      </div>
    </section>
  )
}

function Opiniones() {
  return (
    <section id="opiniones" className="bg-sand-100 py-20">
      <div className="mx-auto max-w-6xl px-5">
        <Titulo etiqueta="Experiencias">Lo que cuentan quienes han constelado</Titulo>
        <div className="grid gap-6 md:grid-cols-3">
          {OPINIONES.map((o, i) => (
            <figure key={i} className="rounded-3xl bg-white p-7 shadow-sm">
              <div className="mb-3 text-gold-500" aria-hidden>✦ ✦ ✦ ✦ ✦</div>
              <blockquote className="mb-4 text-night-700">“{o.texto}”</blockquote>
              <figcaption className="text-xs font-semibold uppercase tracking-wider text-night-500">{o.autor}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

function Contacto() {
  const [enviado, setEnviado] = useState(false)
  const campo = 'mt-1 w-full rounded-xl border border-night-200 px-4 py-3 outline-none focus:border-night-600 focus:ring-2 focus:ring-night-200'
  return (
    <section id="contacto" className="mx-auto max-w-3xl px-5 py-20">
      <Titulo etiqueta="Contacto">Escríbenos, con calma</Titulo>
      {enviado ? (
        <div className="rounded-3xl bg-night-700 p-10 text-center text-white">
          <p className="font-serif text-2xl font-semibold text-gold-300">✦ Gracias ✦</p>
          <p className="mt-2 text-night-100">Te responderemos muy pronto.</p>
        </div>
      ) : (
        <form
          onSubmit={(e) => { e.preventDefault(); setEnviado(true) }}
          className="grid gap-4 rounded-3xl border border-night-100 bg-white p-8 shadow-sm sm:grid-cols-2"
        >
          <label className="text-sm font-medium">
            Nombre
            <input required type="text" className={campo} />
          </label>
          <label className="text-sm font-medium">
            Email o WhatsApp
            <input required type="text" className={campo} />
          </label>
          <label className="text-sm font-medium sm:col-span-2">
            ¿Qué te gustaría trabajar?
            <textarea rows="4" className={campo} />
          </label>
          <button className="rounded-full bg-night-600 px-6 py-3 font-semibold text-white transition hover:bg-night-700 sm:col-span-2">
            Enviar mensaje
          </button>
        </form>
      )}
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-night-900 py-10 text-center text-sm text-night-200">
      <p className="font-serif text-lg text-gold-300">Leticia Murguía · Transformación Sistémica y Constelaciones</p>
      <p className="mt-1">Saltillo, Coahuila</p>
      <a href={FACEBOOK} className="mt-3 inline-block underline hover:text-gold-300" target="_blank" rel="noreferrer">Facebook</a>
      <p className="mt-4 text-xs text-night-200/60">Demo de presentación · textos de ejemplo</p>
    </footer>
  )
}

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <QueEs />
        <Servicios />
        <Proceso />
        <Leticia />
        <Opiniones />
        <Calendario />
        <Contacto />
      </main>
      <Footer />
    </>
  )
}
