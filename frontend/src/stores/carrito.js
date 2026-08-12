import { defineStore } from "pinia";

// IVA de Costa Rica (13%)
export const IVA = 0.13;

// Store del carrito = fuente única de verdad del estado de compra.
// Cualquier componente (NavBar, Catálogo, Carrito, Checkout) lo lee/escribe
// sin pasar props para bajar la complejidad y mantener la separación de responsabilidades.
export const useCarritoStore = defineStore("carrito", {
  // localStorage para que el carrito sobreviva a recargas
  state: () => ({
    items: JSON.parse(localStorage.getItem("carrito") || "[]"),
  }),

  getters: {
    cantidadTotal: (s) => s.items.reduce((n, i) => n + i.cantidad, 0),
    subtotal: (s) => s.items.reduce((n, i) => n + i.precio * i.cantidad, 0),
    iva() {
      return Math.round(this.subtotal * IVA);
    },
    total() {
      return this.subtotal + this.iva;
    },
  },

  actions: {
    // Si el producto ya está entonces suma cantidad, de lo contrario, entonces lo agrega al carrito
    // Guardamos solo lo necesario para el carrito (no todo el objeto producto)
    agregar(producto, cantidad = 1) {
      const existente = this.items.find((i) => i.id === producto.id);
      if (existente) {
        existente.cantidad += cantidad;
      } else {
        this.items.push({
          id: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          imagen: producto.imagen,
          cantidad,
        });
      }
      this.guardar();
    },
    actualizarCantidad(id, cantidad) {
      const item = this.items.find((i) => i.id === id);
      if (!item) return;
      item.cantidad = Math.max(1, cantidad); // nunca baja de 1
      this.guardar();
    },
    eliminar(id) {
      this.items = this.items.filter((i) => i.id !== id);
      this.guardar();
    },
    vaciar() {
      this.items = [];
      this.guardar();
    },
    // Interno: sincroniza el estado con localStorage tras cada cambio
    guardar() {
      localStorage.setItem("carrito", JSON.stringify(this.items));
    },
  },
});
