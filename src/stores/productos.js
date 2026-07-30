import { defineStore } from 'pinia'
import productosBase from '../data/productos.json'

// Store de productos = fuente única del catálogo/inventario.
//
// nota: mientras no haya base de datos, se siembra desde productos.json la
// primera vez y luego se guarda en localStorage, para que los cambios de stock
// (por compras) y las ediciones del inventario del admin persistan sin backend.
export const useProductosStore = defineStore('productos', {
  state: () => ({
    lista: JSON.parse(localStorage.getItem('productos')) || productosBase.map((p) => ({ ...p }))
  }),

  actions: {
    // Rebaja el stock al comprar (nunca baja de 0).
    rebajarStock(id, cantidad) {
      const p = this.lista.find((x) => x.id === id)
      if (p) {
        p.stock = Math.max(0, p.stock - cantidad)
        this.guardar()
      }
    },
    // CRUD del inventario admin (todos persisten en localStorage).
    agregar(producto) {
      this.lista.push(producto)
      this.guardar()
    },
    actualizar(id, cambios) {
      const i = this.lista.findIndex((p) => p.id === id)
      if (i !== -1) {
        this.lista[i] = { ...this.lista[i], ...cambios }
        this.guardar()
      }
    },
    eliminar(id) {
      this.lista = this.lista.filter((p) => p.id !== id)
      this.guardar()
    },
    // Re-lee desde localStorage (para reflejar cambios hechos en otra pestaña).
    sincronizar() {
      const guardado = JSON.parse(localStorage.getItem('productos'))
      if (guardado) this.lista = guardado
    },
    guardar() {
      localStorage.setItem('productos', JSON.stringify(this.lista))
    }
  }
})
