<script setup>
import { computed } from 'vue'
import ProductCard from '../../components/ProductCard.vue'
import categorias from '../../data/categorias.json'
import productos from '../../data/productos.json'

// Página principal solo muestra los productos marcados como destacados
// usar computed nos permite que si los datos cambian, la lista se recalcule sola
const destacados = computed(() => productos.filter((p) => p.destacado).slice(0, 8))
</script>

<template>
  <!-- HERO -->
    <section class="bg-white">
        <div class="container py-5">
            <div class="row align-items-center g-4">
            <div class="col-lg-6">
                <span class="text-primary fw-semibold text-uppercase small" style="letter-spacing: 0.1em">
                Tienda en línea
                </span>
                <h1 class="display-4 fw-bold mt-2">
                Compra fácil, <span class="text-primary">vive mejor.</span>
                </h1>
                <p class="fs-5 text-secondary">
                Descubre una experiencia de compra en línea pensada para vos: simple, segura
                y con productos de calidad a un clic de distancia.
                </p>
                <div class="d-flex flex-wrap gap-2">
                <RouterLink to="/catalogo" class="btn btn-primary btn-lg">Explorar productos</RouterLink>
                </div>
            </div>
            <div class="col-lg-6">
                <img
                src="../../assets/hero-img.png"
                class="img-fluid rounded-4 shadow"
                alt="Productos destacados"
                />
            </div>
        </div>
    </div>
  </section>

  <!-- CATEGORÍAS -->
    <section id="categorias" class="container py-5">
    <h2 class="h4 fw-bold mb-4">Categorías</h2>
    <div class="row g-3">
      <div v-for="cat in categorias" :key="cat.id" class="col-6 col-md-3">
        <!-- Enlaza al catálogo filtrando por categoría vía query param -->
        <RouterLink
          :to="{ name: 'catalogo', query: { categoria: cat.id } }"
          class="card card-producto text-decoration-none text-center py-4 border h-100"
        >
          <div><i class="bi fs-1 text-primary" :class="cat.icono"></i></div>
          <div class="fw-semibold text-dark mt-2">{{ cat.nombre }}</div>
        </RouterLink>
      </div>
    </div>
  </section>

  <!-- DESTACADOS -->
  <section class="container pb-5">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="h4 fw-bold mb-0">Destacados</h2>
      <RouterLink to="/catalogo" class="text-primary text-decoration-none">Ver todo →</RouterLink>
    </div>
    <div class="row g-4">
      <div v-for="p in destacados" :key="p.id" class="col-6 col-md-4 col-lg-3">
        <ProductCard :producto="p" />
      </div>
    </div>
  </section>
</template>
