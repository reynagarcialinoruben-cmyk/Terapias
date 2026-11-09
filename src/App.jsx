import { useState } from 'react'
import Calendario from './Calendario.jsx'
import Reveal from './Reveal.jsx'

const FACEBOOK = 'https://www.facebook.com/leticiamurguiaconstelaciones'

const NAV = [
  ['Constelaciones', '#que-es'],
  ['Servicios', '#servicios'],
  ['Proceso', '#proceso'],
  ['Leticia', '#leticia'],
  ['Preguntas', '#preguntas'],
]

const SERVICIOS = [
  { icon: '✦', titulo: 'Constelación individual', texto: 'Una sesión a solas con Leticia para mirar con calma un tema concreto de tu historia familiar.' },
  { icon: '✧', titulo: 'Constelación en grupo', texto: 'Trabajo en círculo con otras personas, donde cada quien constela su tema y acompaña el de los demás.' },
  { icon: '☽', titulo: 'Transformación sistémica', texto: 'Procesos para ver cómo tus relaciones, tu trabajo y tu familia se influyen entre sí.' },
  { icon: '❖', titulo: 'Constelaciones online', texto: 'La misma sesión, con la misma calidez, por videollamada desde donde estés.' },
  { icon: '☀', titulo: 'Talleres y retiros', texto: 'Jornadas temáticas para profundizar: linaje, pareja, abundancia, duelo y más.' },
  { icon: '✺', titulo: 'Acompañamiento continuo', texto: 'Seguimiento entre sesiones para integrar lo que apareció y darle forma en tu día a día.' },
]

const TEMAS = ['Linaje y ancestros', 'Pareja y relaciones', 'Duelo y pérdidas', 'Abundancia y trabajo', 'Maternidad y paternidad', 'Hermanos y familia de origen', 'Bloqueos personales', 'Decisiones importantes']

const PASOS = [
  { n: 'I', titulo: 'Cuéntanos tu tema', texto: 'Reserva tu fecha y cuéntanos qué te trae. Sin prisa y sin compromiso.' },
  { n: 'II', titulo: 'Elige tu sesión', texto: 'Individual o en grupo, presencial en Saltillo u online. Tú decides.' },
  { n: 'III', titulo: 'Constela', texto: 'Se coloca el tema en el espacio, se observa lo que aparece y se busca un movimiento hacia el orden.' },
  { n: 'IV', titulo: 'Integra', texto: 'Te llevas una imagen nueva de tu historia y los pasos para vivirla.' },
]

const OPINIONES = [
  { texto: 'Llegué con una pregunta que cargaba desde hace años. Salí con una imagen clara y mucha paz.', autor: 'Testimonio de ejemplo' },
  { texto: 'Un espacio muy respetuoso. Leticia acompaña con una calma que se contagia.', autor: 'Testimonio de ejemplo' },
  { texto: 'Pensé que no iba a sentir nada y terminé llorando y agradeciendo a mis abuelos.', autor: 'Testimonio de ejemplo' },
]

const FAQ = [
  ['¿Las constelaciones sustituyen a una terapia psicológica o a un tratamiento médico?', 'No. Son un espacio de exploración y acompañamiento que puede complementar otros procesos, pero no reemplazan la atención de profesionales de la salud.'],
  ['¿Tengo que contar mi historia delante de todos?', 'No. Compartes solo lo que quieras. En el trabajo grupal basta con mencionar brevemente tu tema.'],
  ['¿Puedo participar sin constelar mi propio tema?', 'Sí. Muchas personas acompañan como representantes en los temas de otros y también aprenden de ello.'],
  ['¿Funciona por videollamada?', 'Sí, las sesiones online siguen el mismo proceso. Solo necesitas conexión estable y un lugar tranquilo.'],
  ['¿Cómo reservo?', 'Elige día y hora en el calendario de esta página. Te contactaremos para confirmar tu cita.'],
]

/* ---------- Decoración ---------- */
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
        <line key={i} x1={ESTRELLAS[a][0]} y1={ESTRELLAS[a][1]} x2={ESTRELLAS[b][0]} y2={ESTRELLAS[b][1]}
          stroke="currentColor" strokeOpacity="0.35" strokeWidth="1" />
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

// Estrellas pequeñas de fondo con posiciones fijas (generador pseudoaleatorio con semilla)
const CAMPO = (() => {
  let s = 7
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647)
  return Array.from({ length: 48 }, () => ({ x: rnd() * 100, y: rnd() * 100, r: 0.6 + rnd() * 1.4, d: rnd() * 4 }))
})()

function CampoEstelar() {
  return (
    <svg className="absolute inset-0 h-full w-full text-white" aria-hidden="true">
      {CAMPO.map((e, i) => (
        <circle key={i} cx={`${e.x}%`} cy={`${e.y}%`} r={e.r} fill="currentColor" className="animate-twinkle" style={{ animationDelay: `${e.d}s` }} />
      ))}
    </svg>
  )
}

/* ---------- Piezas ---------- */
function Boton({ href, children, variante = 'primario' }) {
  const base = 'inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900'
  const estilos = {
    primario: 'bg-gold-500 text-night-900 hover:bg-gold-300 hover:shadow-[0_0_30px_-5px] hover:shadow-gold-500',
    secundario: 'border border-gold-300/60 text-gold-300 hover:bg-white/10',
    oscuro: 'bg-night-600 text-white hover:bg-night-700',
  }
  return <a href={href} className={`${base} ${estilos[variante]}`}>{children}</a>
}

function Titulo({ etiqueta, children, claro = false }) {
  return (
    <Reveal className="mx-auto mb-12 max-w-2xl text-center">
      <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-gold-500">✦ {etiqueta} ✦</p>
      <h2 className={`font-serif text-3xl font-semibold sm:text-4xl ${claro ? 'text-white' : ''}`}>{children}</h2>
    </Reveal>
  )
}

function Header() {
  const [abierto, setAbierto] = useState(false)
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-night-900/90 text-white backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <a href="#" className="leading-tight">
          <span className="block font-serif text-lg font-semibold text-gold-300">Leticia Murguía</span>
          <span className="block text-[10px] uppercase tracking-[0.25em] text-night-200">Constelaciones · Saltillo</span>
        </a>
        <nav className="hidden items-center gap-7 lg:flex">
          {NAV.map(([t, h]) => (
            <a key={h} href={h} className="text-sm text-night-100 transition hover:text-gold-300">{t}</a>
          ))}
          <Boton href="#calendario">Reservar sesión</Boton>
        </nav>
        <button className="rounded p-2 text-gold-300 lg:hidden" aria-label="Abrir menú" aria-expanded={abierto} onClick={() => setAbierto(!abierto)}>
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
        </nav>
      )}
    </header>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-night-900 via-night-800 to-night-700 text-white">
      <CampoEstelar />
      <div className="absolute -right-24 top-10 h-96 w-96 rounded-full bg-night-500/30 blur-3xl" aria-hidden />
      <div className="absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-gold-500/10 blur-3xl" aria-hidden />
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 py-20 md:grid-cols-2 md:py-32">
        <div>
          <p className="mb-5 text-sm uppercase tracking-[0.3em] text-gold-300">Transformación sistémica y constelaciones</p>
          <h1 className="font-serif text-4xl font-semibold leading-[1.1] sm:text-5xl lg:text-6xl">
            Cada historia familiar es una <span className="bg-gradient-to-r from-gold-300 to-gold-500 bg-clip-text italic text-transparent">constelación</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg text-night-100/90">
            Un espacio para mirar tus raíces, ordenar lo que pesa y volver a tu lugar con más paz.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Boton href="#calendario">Reservar sesión</Boton>
            <Boton href="#que-es" variante="secundario">¿Qué es una constelación?</Boton>
          </div>
          <ul className="mt-10 flex flex-wrap gap-2 text-xs text-night-100">
            {['📍 Saltillo, Coahuila', '💻 También online', '👥 Individual y grupal'].map((t) => (
              <li key={t} className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5">{t}</li>
            ))}
          </ul>
        </div>
        <div className="animate-drift text-gold-300">
          <Constelacion className="mx-auto w-full max-w-md drop-shadow-[0_0_25px_rgba(201,164,92,0.35)]" />
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-sand-50" aria-hidden />
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
    <section id="que-es" className="mx-auto max-w-6xl scroll-mt-16 px-5 py-20">
      <Titulo etiqueta="Constelaciones">Mirar el sistema para entender lo propio</Titulo>
      <Reveal>
        <p className="mx-auto mb-12 max-w-2xl text-center text-lg text-night-700/80">
          Las constelaciones familiares son un método de trabajo grupal e individual que observa a la persona dentro de su sistema: familia, pareja, trabajo. Se coloca un tema en el espacio y se explora lo que aparece.
        </p>
      </Reveal>
      <div className="grid gap-6 md:grid-cols-3">
        {ideas.map(([t, x], i) => (
          <Reveal key={t} delay={i * 120}>
            <div className="h-full rounded-3xl border border-night-100 bg-white p-8 text-center transition hover:-translate-y-1 hover:shadow-lg">
              <p className="mb-3 text-2xl text-gold-500">✦</p>
              <h3 className="mb-2 font-serif text-xl font-semibold">{t}</h3>
              <p className="text-night-700/80">{x}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function Servicios() {
  return (
    <section id="servicios" className="scroll-mt-16 bg-night-50 py-20">
      <div className="mx-auto max-w-6xl px-5">
        <Titulo etiqueta="Servicios">Formas de acompañarte</Titulo>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICIOS.map((s, i) => (
            <Reveal key={s.titulo} delay={(i % 3) * 100}>
              <article className="group h-full rounded-3xl border border-night-100 bg-white p-7 transition hover:-translate-y-1 hover:border-gold-300 hover:shadow-xl">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-night-700 text-2xl text-gold-300 transition group-hover:rotate-12 group-hover:bg-night-600">{s.icon}</div>
                <h3 className="mb-2 font-serif text-xl font-semibold">{s.titulo}</h3>
                <p className="text-night-700/80">{s.texto}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-14 text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-night-500">Temas que se pueden constelar</p>
          <ul className="mx-auto flex max-w-3xl flex-wrap justify-center gap-2">
            {TEMAS.map((t) => (
              <li key={t} className="rounded-full border border-night-200 bg-white px-4 py-2 text-sm text-night-700">{t}</li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}

function Proceso() {
  return (
    <section id="proceso" className="relative scroll-mt-16 overflow-hidden bg-night-800 py-20 text-white">
      <Constelacion className="absolute -left-20 bottom-0 w-[28rem] text-gold-300 opacity-20" />
      <div className="relative mx-auto max-w-6xl px-5">
        <Titulo etiqueta="Proceso" claro>Así es el camino</Titulo>
        <ol className="grid gap-6 md:grid-cols-4">
          {PASOS.map((p, i) => (
            <Reveal key={p.n} delay={i * 120}>
              <li className="h-full rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm">
                <span className="mb-4 block font-serif text-3xl text-gold-300">{p.n}</span>
                <h3 className="mb-2 font-serif text-lg font-semibold">{p.titulo}</h3>
                <p className="text-sm text-night-100/90">{p.texto}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}

function Leticia() {
  return (
    <section id="leticia" className="mx-auto max-w-6xl scroll-mt-16 px-5 py-20">
      <div className="grid items-center gap-12 md:grid-cols-5">
        <Reveal className="md:col-span-2">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-xs overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-night-600 to-night-900 text-gold-300 shadow-xl">
            <Constelacion className="absolute inset-0 h-full w-full opacity-60" />
            <p className="absolute inset-x-0 bottom-6 text-center text-xs uppercase tracking-widest text-night-200">Tu foto aquí</p>
          </div>
        </Reveal>
        <Reveal delay={150} className="md:col-span-3">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-gold-500">✦ Quién te acompaña ✦</p>
          <h2 className="mb-5 font-serif text-3xl font-semibold sm:text-4xl">Leticia Murguía</h2>
          <p className="mb-4 text-lg text-night-700/80">
            Facilitadora de constelaciones y transformación sistémica en Saltillo, Coahuila. Acompaña a personas y grupos a mirar su historia con respeto, sin juicios y a su propio ritmo.
          </p>
          <p className="mb-6 text-night-700/70">Aquí irá su biografía, formación y trayectoria. Texto de ejemplo para la demo.</p>
          <Boton href={FACEBOOK} variante="oscuro">Visitar su página de Facebook</Boton>
        </Reveal>
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
            <Reveal key={i} delay={i * 120}>
              <figure className="h-full rounded-3xl bg-white p-7 shadow-sm">
                <div className="mb-3 text-gold-500" aria-hidden>✦ ✦ ✦ ✦ ✦</div>
                <blockquote className="mb-4 text-night-700">“{o.texto}”</blockquote>
                <figcaption className="text-xs font-semibold uppercase tracking-wider text-night-500">{o.autor}</figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function Preguntas() {
  return (
    <section id="preguntas" className="mx-auto max-w-3xl scroll-mt-16 px-5 py-20">
      <Titulo etiqueta="Preguntas">Antes de empezar</Titulo>
      <div className="space-y-3">
        {FAQ.map(([p, r], i) => (
          <Reveal key={p} delay={i * 60}>
            <details className="group rounded-2xl border border-night-100 bg-white p-5 open:border-gold-300 open:shadow-md">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
                {p}
                <span className="text-xl text-gold-500 transition group-open:rotate-45" aria-hidden>+</span>
              </summary>
              <p className="mt-3 text-night-700/80">{r}</p>
            </details>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-night-900 pb-24 pt-12 text-center text-sm text-night-200 lg:pb-12">
      <p className="font-serif text-lg text-gold-300">Leticia Murguía · Transformación Sistémica y Constelaciones</p>
      <p className="mt-1">Saltillo, Coahuila</p>
      <p className="mt-3 space-x-4">
        <a href={FACEBOOK} className="underline hover:text-gold-300" target="_blank" rel="noreferrer">Facebook</a>
        <a href="/admin" className="text-night-200/60 hover:text-gold-300">Acceso administrador</a>
      </p>
      <p className="mt-4 text-xs text-night-200/60">Demo de presentación · textos de ejemplo</p>
    </footer>
  )
}

// Botón fijo para reservar desde el celular
function CtaMovil() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-night-900/95 p-3 backdrop-blur lg:hidden">
      <a href="#calendario" className="block rounded-full bg-gold-500 py-3 text-center text-sm font-semibold text-night-900">
        Reservar sesión
      </a>
    </div>
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
        <Preguntas />
      </main>
      <Footer />
      <CtaMovil />
    </>
  )
}
