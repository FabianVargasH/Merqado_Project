import api from '../services/api'

const CLAVE = 'merqado_usuario'

export function obtenerUsuario() {
  return JSON.parse(localStorage.getItem(CLAVE) || 'null')
}

export function guardarUsuario(usuario) {
  localStorage.setItem(CLAVE, JSON.stringify(usuario))
}

export function cerrarSesion() {
  localStorage.removeItem(CLAVE)
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
    token: data.token,
    ingresoEn: new Date().toISOString(),
  }

  guardarUsuario(usuario)
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
  return usuario
}