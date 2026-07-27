<script setup>
import { useCarritoStore } from '../stores/carrito';
import { formatearColones } from '../utils/formato';

// Componente reutilizable de tarjeta de producto

// Recibe el producto por prop, es decir, lo recibe como una propiedad del componente. Luego, agrega al carrito por el store (sin emitir eventos).
defineProps({
  producto: { type: Object, required: true }
})

const carrito = useCarritoStore()
</script>

<template>
  <div class="card card-producto h-100 border">
    <RouterLink :to="{ name: 'producto', params: { id: producto.id } }">
      <img
        :src="producto.imagen"
        class="card-img-top"
        :alt="producto.nombre"
        style="aspect-ratio: 1; object-fit: cover"
        loading="lazy"
      />
    </RouterLink>

    <div class="card-body d-flex flex-column">
      <small class="text-secondary">{{ producto.marca }}</small>
      <RouterLink
        :to="{ name: 'producto', params: { id: producto.id } }"
        class="text-decoration-none text-dark"
      >
        <h6 class="card-title text-truncate mb-1">{{ producto.nombre }}</h6>
      </RouterLink>

      <!-- Estrellas dibujadas según la calificación (0–5) -->
      <div class="text-warning small mb-2">
        <i
          v-for="n in 5"
          :key="n"
          class="bi"
          :class="n <= Math.round(producto.calificacion) ? 'bi-star-fill' : 'bi-star'"
        ></i>
        <span class="text-secondary ms-1">({{ producto.resenas }})</span>
      </div>

      <!-- mt-auto empuja el precio/botón al fondo para que todas las tarjetas se alineen igual -->
      <div class="mt-auto d-flex align-items-center justify-content-between">
        <div>
          <span
            v-if="producto.precioAnterior"
            class="text-secondary text-decoration-line-through small d-block"
          >
            {{ formatearColones(producto.precioAnterior) }}
          </span>
          <span class="fw-bold text-primary fs-6">{{ formatearColones(producto.precio) }}</span>
        </div>
        <button
          class="btn btn-primary btn-sm"
          aria-label="Agregar al carrito"
          @click="carrito.agregar(producto)"
        >
          <i class="bi bi-cart-plus"></i>
        </button>
      </div>
    </div>
  </div>
</template>