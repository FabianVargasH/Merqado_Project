import api from '../services/api'
import { useCarritoStore } from '../stores/carrito'

// merqado_usuario guarda el token de sesión (la credencial JWT) y una copia de los
// datos del perfil que devuelve la base al autenticar. El token debe vivir en el
// cliente porque es lo que autentica cada petición contra la API; los datos del
// perfil siempre nacen de la base (login/registro/perfil).
const CLAVE = 'merqado_usuario'

export function obtenerUsuario() {
  return JSON.parse(localStorage.getItem(CLAVE) || 'null')
}

export function guardarUsuario(usuario) {
  localStorage.setItem(CLAVE, JSON.stringify(usuario))
}

export function cerrarSesion() {
  localStorage.removeItem(CLAVE)
  // El carrito guardado sigue en la base; solo limpiamos el estado en memoria.
  useCarritoStore().limpiarLocal()
}

export async function iniciarSesion({ correo, password }) {
  const { data } = await api.post('/usuarios/login', {
    correo,
    contrasenna: password,
  })

  const usuario = {
    nombre: data.usuario.nombre,
    correo: data.usuario.correo,
    tipoUsuario: data.usuario.tipoUsuario,
    telefono: data.usuario.telefono ?? '',
    fechaNacimiento: data.usuario.fechaNacimiento ?? null,
    token: data.token,
    ingresoEn: new Date().toISOString(),
  }

  guardarUsuario(usuario)
  // Combina el carrito de invitado (en memoria) con el guardado en la base.
  useCarritoStore().sincronizarConSesion().catch(() => {})
  return usuario
}

export async function registrarUsuario({ nombre, correo, password }) {
  const { data } = await api.post('/usuarios/registro', {
    nombre,
    correo,
    contrasenna: password,
    tipoUsuario: 'cliente',
  })

  const usuario = {
    nombre: data.usuario.nombre,
    correo: data.usuario.correo,
    tipoUsuario: data.usuario.tipoUsuario,
    token: data.token,
    ingresoEn: new Date().toISOString(),
  }

  guardarUsuario(usuario)
  // Sube el carrito de invitado (en memoria) a la base del nuevo usuario.
  useCarritoStore().sincronizarConSesion().catch(() => {})
  return usuario
}

// actualiza los datos personales del usuario logueado
export async function actualizarPerfil({ nombre, telefono, fechaNacimiento }) {
  const { data } = await api.patch('/usuarios/perfil', {
    nombre,
    telefono,
    fechaNacimiento,
  })

  const usuarioActual = obtenerUsuario()
  const usuarioActualizado = {
    ...usuarioActual,
    nombre: data.usuario.nombre,
    telefono: data.usuario.telefono,
    fechaNacimiento: data.usuario.fechaNacimiento,
  }

  guardarUsuario(usuarioActualizado)
  return usuarioActualizado
}