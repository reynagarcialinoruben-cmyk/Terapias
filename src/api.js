export async function api(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(path, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  let data = null
  try {
    data = await res.json()
  } catch {
    /* respuesta sin cuerpo */
  }
  if (!res.ok) {
    const err = new Error(data?.error || 'No se pudo completar la solicitud')
    err.status = res.status
    throw err
  }
  return data
}

export const HORAS = ['09:00', '10:00', '11:00', '12:00', '16:00', '17:00', '18:00', '19:00']

// Fecha local -> 'YYYY-MM-DD' (sin pasar por UTC)
export const toISO = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

// 'YYYY-MM-DD' -> Date local
export const fromISO = (s) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}
