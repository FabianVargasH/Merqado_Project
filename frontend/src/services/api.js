import axios from 'axios'

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5743/api').replace(/\/$/, '')

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('merqado_usuario') || 'null')
  } catch {
    return null
  }
}

function getAccessToken() {
  return getStoredUser()?.token || localStorage.getItem('merqado_access_token') || localStorage.getItem('token')
}

function getTokenPayload() {
  const token = getAccessToken()
  if (!token) return null
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export async function apiRequest(path, options = {}) {
  try {
    const response = await api.request({
      url: path,
      method: options.method || 'GET',
      headers: options.headers,
      data: options.body ? JSON.parse(options.body) : undefined,
    })
    return response.data
  } catch (error) {
    const data = error.response?.data || {}
    throw new Error(data.error || data.msj || 'No se pudo completar la solicitud')
  }
}

export { API_URL, getAccessToken, getTokenPayload }
export default api
