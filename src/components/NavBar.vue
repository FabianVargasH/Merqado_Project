<script setup>
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useCarritoStore } from '../stores/carrito'
import logo from '../assets/cuentaIcon.png'

// Leemos el carrito global para mostrar el contador. storeToRefs mantiene la reactividad del getter (si no, perdería la reactividad al desestructurar).
// desestructurar es cuando sacamos propiedades de un objeto y las guardamos en variables separadas, como { cantidadTotal } = carrito. Si no usamos storeToRefs, cantidadTotal se vuelve una copia estática y no se actualiza cuando cambia el carrito.
const carrito = useCarritoStore()
const { cantidadTotal } = storeToRefs(carrito)

// Ruta actual para calcular el resaltado. Lo hacemos a mano y no con router-link-active porque "Ofertas" y "Catálogo" comparten la misma ruta
// (/catalogo) y solo se distinguen por el query ?descuento=true.
const route = useRoute()
const esOfertas = () => route.path === '/catalogo' && route.query.descuento === 'true'
</script>

<template>
  <!--  Barra SUPERIOR  -->
  <nav class="navbar bg-white border-bottom sticky-top">
    <div class="container">
      <RouterLink class="navbar-brand fw-bold text-primary fs-4" to="/">Merqado</RouterLink>

      <!-- Enlaces solo en desktop, en celular se usa la barra inferior
           La clase "activo" marca la opción de la página actual -->
      <ul class="navbar-nav flex-row gap-4 d-none d-lg-flex">
        <li class="nav-item">
          <RouterLink class="nav-link" :class="{ activo: route.path === '/' }" to="/">Inicio</RouterLink>
        </li>
        <template v-if="route.path === '/'">
          <li class="nav-item">
            <a class="nav-link" href="#nosotros">Nosotros</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#valores">Valores</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#equipo">Equipo</a>
          </li>
        </template>
        <li class="nav-item">
          <RouterLink class="nav-link" :class="{ activo: route.path === '/catalogo' && !esOfertas() }" to="/catalogo">
            Catálogo
          </RouterLink>
        </li>
        <li class="nav-item">
          <RouterLink class="nav-link" :class="{ activo: route.path.startsWith('/cuenta') }" to="/cuenta">
            Cuenta
          </RouterLink>
        </li>
      </ul>

      <div class="d-flex align-items-center gap-2">
        <RouterLink class="btn btn-light position-relative" to="/carrito" aria-label="Carrito">
          <i class="bi bi-cart"></i>
          <span v-if="cantidadTotal"
            class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {{ cantidadTotal }}
          </span>
        </RouterLink>
        <RouterLink class="btn btn-primary d-none d-lg-inline-flex" to="/login"><img :src="logo" alt="Logo"
            class="logo" />
        </RouterLink>
      </div>
    </div>
  </nav>

  <!--  Barra INFERIOR (solo celular)  -->
  <nav class="navbar fixed-bottom bg-white border-top d-lg-none">
    <div class="container-fluid justify-content-around">
      <RouterLink class="nav-movil text-center text-decoration-none" to="/">
        <i class="bi bi-house d-block fs-5"></i><span class="small">Inicio</span>
      </RouterLink>
      <RouterLink class="nav-movil text-center text-decoration-none" to="/catalogo">
        <i class="bi bi-search d-block fs-5"></i><span class="small">Buscar</span>
      </RouterLink>
      <RouterLink class="nav-movil text-center text-decoration-none position-relative" to="/carrito">
        <i class="bi bi-cart d-block fs-5"></i><span class="small">Carrito</span>
        <span v-if="cantidadTotal"
          class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
          {{ cantidadTotal }}
        </span>
      </RouterLink>
      <RouterLink class="nav-movil text-center text-decoration-none" to="/cuenta">
        <i class="bi bi-person d-block fs-5"></i><span class="small">Cuenta</span>
      </RouterLink>
    </div>
  </nav>
</template>

<style scoped>
/* Resaltado de la opción activa en la barra superior (subrayado morado) */
.nav-link.activo {
  color: var(--marca-primary);
  font-weight: 600;
  border-bottom: 2px solid var(--marca-primary);
}

/* Ítem de la barra inferior: gris, y morado cuando la ruta está activa */
.nav-movil {
  color: var(--bs-secondary-color);
}

.nav-movil.router-link-exact-active {
  color: var(--marca-primary);
}
</style>