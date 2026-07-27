<script setup>
import { storeToRefs } from 'pinia'
import { useCarritoStore } from '../stores/carrito'

// Leemos el carrito global para mostrar el contador. storeToRefs mantiene la reactividad del getter (si no, perdería la reactividad al desestructurar).
// desestructurar es cuando sacamos propiedades de un objeto y las guardamos en variables separadas, como { cantidadTotal } = carrito. Si no usamos storeToRefs, cantidadTotal se vuelve una copia estática y no se actualiza cuando cambia el carrito.
const carrito = useCarritoStore()
const { cantidadTotal } = storeToRefs(carrito)
</script>

<template>
  <!-- navbar-expand-lg: colapsa a menú hamburguesa en celular-->
  <nav class="navbar navbar-expand-lg bg-white border-bottom sticky-top">
    <div class="container">
      <RouterLink class="navbar-brand fw-bold text-primary fs-4" to="/">Merqado</RouterLink>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navPrincipal"
        aria-label="Menú"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navPrincipal">
        <ul class="navbar-nav me-auto">
          <!-- RouterLink marca solo la ruta activa automáticamente -->
          <li class="nav-item"><RouterLink class="nav-link" to="/">Inicio</RouterLink></li>
          <li class="nav-item"><RouterLink class="nav-link" to="/catalogo">Catálogo</RouterLink></li>
          <li class="nav-item">
            <RouterLink class="nav-link" :to="{ name: 'catalogo', query: { descuento: 'true' } }">Ofertas</RouterLink>
          </li>
          <li class="nav-item"><RouterLink class="nav-link" to="/cuenta">Cuenta</RouterLink></li>
        </ul>

        <div class="d-flex align-items-center gap-2">
          <RouterLink class="btn btn-light position-relative" to="/carrito" aria-label="Carrito">
            <i class="bi bi-cart"></i>
            <!-- Insignia con el total de artículos, y oculta si el carrito está vacío -->
            <span
              v-if="cantidadTotal"
              class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
            >
              {{ cantidadTotal }}
            </span>
          </RouterLink>
          <RouterLink class="btn btn-primary" to="/login">Ingresar</RouterLink>
        </div>
      </div>
    </div>
  </nav>
</template>