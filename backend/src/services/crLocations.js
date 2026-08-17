// consumo de la API pública de ubicaciones de Costa Rica (provincias, cantones ydistritos)

const BASE_URL = 'https://ubicaciones.paginasweb.cr'

async function fetchJson(url, timeoutMs = 5000) {
  
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
