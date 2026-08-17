import { defineStore } from 'pinia'
import { apiRequest } from '../services/api'

//admin puede crear/editar/eliminar categorías y el cambio se refleje en el catálogo del cliente
export const useCategoriasStore = defineStore('categorias', {
  state: () => ({
    lista: [],
    cargando: false,
    error: ''
  }),

  actions: {
    async cargar() {
      this.cargando = true
      this.error = ''
      try {
        const { categories } = await apiRequest('/categories')
        this.lista.splice(0, this.lista.length, ...categories)
        return categories
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.cargando = false
      }
    },
    async agregar(categoria) {
      const { category } = await apiRequest('/categories', { method: 'POST', body: JSON.stringify(categoria) })
      this.lista.push(category)
      return category
    },
    async actualizar(id, cambios) {
      const { category } = await apiRequest(`/categories/${id}`, { method: 'PATCH', body: JSON.stringify(cambios) })
      const i = this.lista.findIndex((c) => c.id === id)
      if (i !== -1) this.lista[i] = { ...this.lista[i], ...category }
      return category
    },
    async eliminar(id) {
      await apiRequest(`/categories/${id}`, { method: 'DELETE' })
      const i = this.lista.findIndex((c) => c.id === id)
      if (i !== -1) this.lista.splice(i, 1)
    }
  }
})
