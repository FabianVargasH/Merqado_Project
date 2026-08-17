// Consumo de la API pública de ubicaciones de Costa Rica (provincias, cantones y
// distritos), gratuita y sin API key. Alimenta el formulario de envío con datos
// reales en cascada, en vez de listas fijas o texto libre.
//
// why en el backend y no desde el navegador: evita problemas de CORS y mantiene
// el consumo del tercero en una capa de servicio con su propio timeout y manejo
// de errores, como el resto de la app.

const BASE_URL = 'https://ubicaciones.paginasweb.cr'

async function fetchJson(url, timeoutMs = 5000) {
  // AbortController: si el tercero tarda demasiado no colgamos la petición.
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, { signal: controller.signal })
    if (!response.ok) throw new Error(`Ubicaciones API respondió ${response.status}`)
    return await response.json()
  } finally {
    clearTimeout(timer)
  }
}

// La API devuelve { "1": "San José", ... }. Lo pasamos a una lista [{ id, nombre }]
// ordenada por nombre, que es más cómoda de consumir para el frontend.
function toList(mapa) {
  return Object.entries(mapa)
    .map(([id, nombre]) => ({ id, nombre }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
}

async function getProvincias() {
  return toList(await fetchJson(`${BASE_URL}/provincias.json`))
}

async function getCantones(provincia) {
  return toList(await fetchJson(`${BASE_URL}/provincia/${provincia}/cantones.json`))
}

async function getDistritos(provincia, canton) {
  return toList(await fetchJson(`${BASE_URL}/provincia/${provincia}/canton/${canton}/distritos.json`))
}

module.exports = { getProvincias, getCantones, getDistritos, BASE_URL }
