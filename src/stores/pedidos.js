import { defineStore } from 'pinia'

// Store de pedidos = historial de compras del cliente.
//
// nota: mientras no haya base de datos, los pedidos se guardan en el
// localStorage. Cuando se conecte una base de datos real, solo cambia de dónde se leen y
// escriben los pedidos y el resto de la app (checkout y "Mis pedidos") queda igual.
export const usePedidosStore = defineStore('pedidos', {
  state: () => ({
    lista: JSON.parse(localStorage.getItem('pedidos') || '[]')
  }),

  actions: {
    // Registra una compra. unshift = el pedido más reciente queda de primero.
    registrar(pedido) {
      this.lista.unshift(pedido)
      this.guardar()
    },
    // El admin cambia el estado de un pedido (Procesando, En camino, Entregado, Cancelado).
    cambiarEstado(numero, estado) {
      const p = this.lista.find((x) => x.numero === numero)
      if (p) {
        p.estado = estado
        this.guardar()
      }
    },
    // Re-lee desde localStorage: sirve para reflejar cambios hechos en OTRA
    // pestaña (ej. el admin cambia el estado y el cliente lo ve sin recargar).
    sincronizar() {
      this.lista = JSON.parse(localStorage.getItem('pedidos') || '[]')
    },
    guardar() {
      localStorage.setItem('pedidos', JSON.stringify(this.lista))
    }
  }
})