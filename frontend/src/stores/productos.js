import { defineStore } from 'pinia'
import { apiRequest } from '../services/api'

// los productos viven en la base de datos y se consumen por /products
export const useProductosStore = defineStore('productos', {
  state: () => ({
    lista: [],
    cargando: false,
    error: ''
  }),

  actions: {
    async cargar(params = {}) {
      this.cargando = true
      this.error = ''
      try {
        const query = new URLSearchParams(params).toString()
        const { products } = await apiRequest(`/products${query ? `?${query}` : ''}`)
        this.lista.splice(0, this.lista.length, ...products)
        return products
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.cargando = false
      }
    },
    async agregar(producto) {
      const { product } = await apiRequest('/products', { method: 'POST', body: JSON.stringify(producto) })
      this.lista.push(product)
      return product
    },
    async actualizar(id, cambios) {
      const { product } = await apiRequest(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(cambios) })
      const i = this.lista.findIndex((p) => p.id === id)
      if (i !== -1) this.lista[i] = product
      return product
    },
    async eliminar(id) {
      await apiRequest(`/products/${id}`, { method: 'DELETE' })
      const i = this.lista.findIndex((p) => p.id === id)
      if (i !== -1) this.lista.splice(i, 1)
    }
  }
})
