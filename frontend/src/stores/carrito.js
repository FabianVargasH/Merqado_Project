import { defineStore } from "pinia";
import { apiRequest, getAccessToken } from "../services/api";

// IVA de Costa Rica (13%)
export const IVA = 0.13;

// Store del carrito = fuente única de verdad del estado de compra en el cliente.
//
// why: el carrito se persiste en la base de datos (una entidad por usuario). El
// estado vive en memoria mientras el usuario es invitado y se sincroniza con el
// backend al iniciar sesión, de modo que la base es la fuente de verdad y el
// carrito sigue al usuario entre sesiones/dispositivos (ya no en localStorage).
export const useCarritoStore = defineStore("carrito", {
  state: () => ({
    items: [],
  }),

  getters: {
    cantidadTotal: (s) => s.items.reduce((n, i) => n + i.cantidad, 0),
    // El precio de cada producto YA incluye el IVA (13%). Por eso el subtotal es la
    // suma de los precios mostrados y el total no le suma ningún impuesto encima.
    subtotal: (s) => s.items.reduce((n, i) => n + i.precio * i.cantidad, 0),
    // IVA ya contenido en el precio (informativo): precio * 13/113, no 13% encima.
    iva() {
      return Math.round(this.subtotal * (IVA / (1 + IVA)));
    },
    total() {
      return this.subtotal;
    },
  },

  actions: {
    // Si el producto ya está entonces suma cantidad, de lo contrario lo agrega.
    // Guardamos solo lo necesario para el carrito (no todo el objeto producto).
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

    // Persiste el carrito completo en el backend si hay sesión. Si es invitado,
    // el carrito solo vive en memoria hasta que inicie sesión.
    async persistir() {
      if (!getAccessToken()) return;
      try {
        await apiRequest("/cart", { method: "PUT", body: JSON.stringify({ items: this.items }) });
      } catch {
        // Si la red falla, el estado en memoria sigue siendo válido para la UI.
      }
    },

    // Carga el carrito del usuario desde la base (al abrir la app con sesión ya activa).
    async cargar() {
      if (!getAccessToken()) return;
      try {
        const { cart } = await apiRequest("/cart");
        this.items = cart.items || [];
      } catch {
        // Sin conexión dejamos el carrito en memoria como está.
      }
    },

    // Al iniciar sesión: combina lo que el invitado tenía en memoria con el
    // carrito guardado en la base (suma cantidades por producto) y lo sincroniza.
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

    // Limpia solo el estado en memoria (al cerrar sesión). No toca la base: el
    // carrito guardado del usuario debe seguir ahí para su próxima sesión.
    limpiarLocal() {
      this.items = [];
    },
  },
});
