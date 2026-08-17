import { defineStore } from "pinia";
import { apiRequest, getAccessToken } from "../services/api";

// IVA de Costa Rica (13%)
export const IVA = 0.13;

export const useCarritoStore = defineStore("carrito", {
  state: () => ({
    items: [],
  }),

  getters: {
    cantidadTotal: (s) => s.items.reduce((n, i) => n + i.cantidad, 0),

    subtotal: (s) => s.items.reduce((n, i) => n + i.precio * i.cantidad, 0),
    
    iva() {
      return Math.round(this.subtotal * (IVA / (1 + IVA)));
    },
    total() {
      return this.subtotal;
    },
  },

  actions: {
    
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
      this.persistir();
    },
    actualizarCantidad(id, cantidad) {
      const item = this.items.find((i) => i.id === id);
      if (!item) return;
      item.cantidad = Math.max(1, cantidad); // nunca baja de 1
      this.persistir();
    },
    eliminar(id) {
      this.items = this.items.filter((i) => i.id !== id);
      this.persistir();
    },
    vaciar() {
      this.items = [];
      this.persistir();
    },


    async persistir() {
      if (!getAccessToken()) return;
      try {
        await apiRequest("/cart", { method: "PUT", body: JSON.stringify({ items: this.items }) });
      } catch {
        // Si la red falla, el estado en memoria sigue siendo válido para la UI.
      }
    },

    
    async cargar() {
      if (!getAccessToken()) return;
      try {
        const { cart } = await apiRequest("/cart");
        this.items = cart.items || [];
      } catch {
        // Sin conexión dejamos el carrito en memoria como está.
      }
    },

    
    async sincronizarConSesion() {
      if (!getAccessToken()) return;
      const locales = this.items;
      let remotos = [];
      try {
        const { cart } = await apiRequest("/cart");
        remotos = cart.items || [];
      } catch {
        return; // sin conexión conservamos el carrito local
      }
      if (!locales.length) {
        this.items = remotos;
        return;
      }
      const combinado = new Map(remotos.map((item) => [item.id, { ...item }]));
      for (const item of locales) {
        const existente = combinado.get(item.id);
        if (existente) existente.cantidad += item.cantidad;
        else combinado.set(item.id, { ...item });
      }
      this.items = [...combinado.values()];
      await this.persistir();
    },

    
    limpiarLocal() {
      this.items = [];
    },
  },
});
