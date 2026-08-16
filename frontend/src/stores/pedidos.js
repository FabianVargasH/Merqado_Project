import { defineStore } from 'pinia'
import { apiRequest } from '../services/api'

// Store de pedidos = historial de compras del cliente.
//
// nota: mientras no haya base de datos, los pedidos se guardan en el
// localStorage. Cuando se conecte una base de datos real, solo cambia de dónde se leen y
// escriben los pedidos y el resto de la app (checkout y "Mis pedidos") queda igual.
export const usePedidosStore = defineStore('pedidos', {
  state: () => ({
    lista: [],
    cargando: false,
    error: ''
  }),

  actions: {
    async registrar({ items, shipping }) {
      const { order } = await apiRequest('/orders', {
        method: 'POST',
        body: JSON.stringify({
          items: items.map((item) => ({ productId: item.id, quantity: item.cantidad })),
          shipping,
        }),
      })
      this.lista.unshift(order)
      return order
    },
    async cargarMisPedidos() {
      this.cargando = true
      try {
        const { orders } = await apiRequest('/orders/me')
        this.lista.splice(0, this.lista.length, ...orders)
        return orders
      } finally {
        this.cargando = false
      }
    },
    async cargarAdminPedidos() {
      this.cargando = true
      try {
        const { orders } = await apiRequest('/orders/admin/all')
        this.lista.splice(0, this.lista.length, ...orders)
        return orders
      } finally {
        this.cargando = false
      }
    },
    async cambiarEstado(numero, estado) {
      const p = this.lista.find((x) => x.numero === numero)
      if (p) {
        const { order } = await apiRequest(`/orders/admin/${p._id}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ estado }),
        })
        Object.assign(p, order)
        return order
      }
    },
    sincronizar() {
      return this.cargarMisPedidos()
    }
  }
})
