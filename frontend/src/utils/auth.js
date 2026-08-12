//archivo temporal mientras se incorpora la base de datos
const CLAVE = "merqado_usuario";

// Sesión simulada porque no hay backend real todavía, así que el "usuario"
// se guarda en localStorage y sobrevive a recargas, igual que el carrito.
export function obtenerUsuario() {
  return JSON.parse(localStorage.getItem(CLAVE) || "null");
}

export function guardarUsuario(usuario) {
  localStorage.setItem(CLAVE, JSON.stringify(usuario));
}

export function cerrarSesion() {
  localStorage.removeItem(CLAVE);
}