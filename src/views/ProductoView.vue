<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import ProductCard from '../components/ProductCard.vue'
import productos from '../data/productos.json'
import { useCarritoStore } from '../stores/carrito'
import { formatearColones } from '../utils/formato'

const route = useRoute()
const carrito = useCarritoStore()

// Producto según el id de la URL. computed lo que significa que si navego a otro product dentro del mismo componente, entonces se recalcula solo.
const producto = computed(() => productos.find((p) => p.id === Number(route.params.id)))

// Relacionados, es decir, otros productos de la misma categoría, pero no el mismo producto. Limitado a 4.
const relacionados = computed(() => {
  if (!producto.value) return []
  return productos
    .filter((p) => p.categoria === producto.value.categoria && p.id !== producto.value.id)
    .slice(0, 4)
})

const cantidad = ref(1)
const agregado = ref(false)

// Al cambiar de producto, reiniciar cantidad y subir al inicio.
watch(
  () => route.params.id,
  () => {
    cantidad.value = 1
    agregado.value = false
    window.scrollTo({ top: 0 })
  }
)

function agregar() {
  carrito.agregar(producto.value, cantidad.value)
  agregado.value = true
  // El aviso desaparece solo tras 2.5s
  setTimeout(() => (agregado.value = false), 2500)
}
</script>

<template>
  <div class="container py-4">
    <!-- Producto no encontrado por id inválido en la URL -->
    <div v-if="!producto" class="text-center py-5">
      <i class="bi bi-exclamation-circle text-secondary" style="font-size: 3rem"></i>
      <h1 class="h4 mt-3">Producto no encontrado</h1>
      <RouterLink to="/catalogo" class="btn btn-primary mt-2">Volver al catálogo</RouterLink>
    </div>

    <template v-else>
      <!-- estilos -->
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb small">
          <li class="breadcrumb-item"><RouterLink to="/">Inicio</RouterLink></li>
          <li class="breadcrumb-item"><RouterLink to="/catalogo">Catálogo</RouterLink></li>
          <li class="breadcrumb-item active">{{ producto.nombre }}</li>
        </ol>
      </nav>

      <div class="row g-4 mb-5">
        <!-- Imagen -->
        <div class="col-lg-6">
          <div class="card border overflow-hidden">
            <img :src="producto.imagen" :alt="producto.nombre" class="w-100" style="aspect-ratio: 1; object-fit: cover" />
          </div>
        </div>

        <!-- Información + compra -->
        <div class="col-lg-6">
          <small class="text-secondary">{{ producto.marca }}</small>
          <h1 class="h3 fw-bold">{{ producto.nombre }}</h1>

          <!-- Calificación del producto -->
          <div class="text-warning mb-3">
            <i
              v-for="n in 5"
              :key="n"
              class="bi"
              :class="n <= Math.round(producto.calificacion) ? 'bi-star-fill' : 'bi-star'"
            ></i>
            <span class="text-secondary small ms-1">
              {{ producto.calificacion }} ({{ producto.resenas }} reseñas)
            </span>
          </div>

          <!-- Precio + precio anterior en caso de estar en oferta -->
          <div class="d-flex align-items-baseline gap-2 mb-3">
            <span class="h3 fw-bold text-primary mb-0">{{ formatearColones(producto.precio) }}</span>
            <span v-if="producto.precioAnterior" class="text-secondary text-decoration-line-through">
              {{ formatearColones(producto.precioAnterior) }}
            </span>
          </div>

          <p class="text-secondary">{{ producto.descripcion }}</p>

          <!-- Estado de inventario -->
          <p v-if="producto.stock > 0" class="text-success small mb-3">
            <i class="bi bi-check-circle-fill"></i> En stock ({{ producto.stock }} disponibles)
          </p>
          <p v-else class="text-danger small mb-3">
            <i class="bi bi-x-circle-fill"></i> Agotado
          </p>

          <!-- Cantidad y agregar -->
          <div class="d-flex align-items-center gap-3">
            <div class="btn-group" role="group" aria-label="Cantidad">
              <button
                class="btn btn-outline-secondary"
                :disabled="cantidad <= 1"
                @click="cantidad--"
              >
                <i class="bi bi-dash"></i>
              </button>
              <span class="btn btn-outline-secondary disabled text-dark">{{ cantidad }}</span>
              <button
                class="btn btn-outline-secondary"
                :disabled="cantidad >= producto.stock"
                @click="cantidad++"
              >
                <i class="bi bi-plus"></i>
              </button>
            </div>

            <button class="btn btn-primary flex-grow-1" :disabled="producto.stock === 0" @click="agregar">
              <i class="bi bi-cart-plus me-1"></i> Agregar al carrito
            </button>
          </div>

          <!-- Aviso de agregado -->
          <div v-if="agregado" class="alert alert-success mt-3 py-2 mb-0" role="alert">
            <i class="bi bi-check-circle me-1"></i>
            Agregado al carrito.
            <RouterLink to="/carrito" class="alert-link">Ver carrito</RouterLink>
          </div>
        </div>
      </div>

      <!-- Relacionados -->
      <section v-if="relacionados.length">
        <h2 class="h5 fw-bold mb-3">También te puede gustar</h2>
        <div class="row g-3">
          <div v-for="p in relacionados" :key="p.id" class="col-6 col-md-3">
            <ProductCard :producto="p" />
          </div>
        </div>
      </section>
    </template>
  </div>
</template>
