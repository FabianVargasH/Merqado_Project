import { defineStore } from 'pinia'
import { apiRequest } from '../services/api'

// Store de pedidos = historial de compras del cliente.
//
// why: los pedidos viven en la base de datos y se consumen por la API REST
// (/orders). Este store solo refleja el estado del servidor.
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
    // Una orden por su número (para la factura). Reusa la lista si ya está cargada.
    async cargarPorNumero(numero) {
      const existente = this.lista.find((p) => p.numero === numero)
      if (existente) return existente
      const { order } = await apiRequest(`/orders/by-number/${numero}`)
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
    }
  }
})
