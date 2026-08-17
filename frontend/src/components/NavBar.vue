<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useCarritoStore } from '../stores/carrito'
import { getAccessToken } from '../services/api'
import logo from '../assets/cuentaIcon.png'

// Contador del carrito (reactivo).
const carrito = useCarritoStore()
const { cantidadTotal } = storeToRefs(carrito)

// Ruta actual. "Ofertas" y "Catálogo" comparten /catalogo (se distinguen por el query).
const route = useRoute()
const esOfertas = () => route.path === '/catalogo' && route.query.descuento === 'true'

// Si hay sesión activa, el botón de la derecha lleva a la cuenta; si no, al login.
// Se recalcula al cambiar de ruta (login/logout siempre navegan), así se mantiene al día.
const sesionActiva = ref(Boolean(getAccessToken()))
watch(() => route.path, () => { sesionActiva.value = Boolean(getAccessToken()) })

// ── Scroll-spy: qué sección de Inicio está a la vista ────────────────────
const seccionActiva = ref(null)
const orden = ['nosotros', 'valores', 'equipo']
let ticking = false

function calcularSeccion() {
  if (route.path !== '/') return (seccionActiva.value = null)
  // Cerca del tope siempre gana Inicio (no marcamos ninguna sección).
  if (window.scrollY < 90) return (seccionActiva.value = null)
  // La sección activa es la última cuyo tope ya cruzó la línea del 25% de la pantalla.
  const linea = window.innerHeight * 0.25
  let activa = null
  for (const id of orden) {
    const el = document.getElementById(id)
    if (el && el.getBoundingClientRect().top <= linea) activa = id
  }
  seccionActiva.value = activa
}
function alScrollear() {
  if (ticking) return
  ticking = true
  requestAnimationFrame(() => {
    calcularSeccion()
    ticking = false
  })
}
watch(() => route.path, () => nextTick(calcularSeccion))
onMounted(() => {
  window.addEventListener('scroll', alScrollear, { passive: true })
  calcularSeccion()
})
onBeforeUnmount(() => window.removeEventListener('scroll', alScrollear))

// Al hacer clic en Inicio: subir al tope, así el subrayado vuelve a "Inicio".
function irInicio() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// ── Telón (JS): colapso 1:1 del ancho real + margen negativo que absorbe el
//    gap del flex, para que el cierre no tenga salto al final ──────────────
const CURVA = 'cubic-bezier(0.22, 1, 0.36, 1)'
const GAP = '1.5rem'
function onEnter(el, done) {
  const w = el.scrollWidth
  el.style.overflow = 'hidden'
  el.style.whiteSpace = 'nowrap'
  el.style.transition = 'none'
  el.style.maxWidth = '0px'
  el.style.opacity = '0'
  el.style.transform = 'scaleX(0.4)'
  el.style.marginLeft = `-${GAP}`
  void el.offsetWidth // reflow
  el.style.transition = `max-width 0.45s ${CURVA}, opacity 0.4s ease, transform 0.45s ${CURVA}, margin-left 0.45s ${CURVA}`
  el.style.maxWidth = w + 'px'
  el.style.opacity = '1'
  el.style.transform = 'scaleX(1)'
  el.style.marginLeft = '0px'
  setTimeout(() => {
    el.style.transition = el.style.maxWidth = el.style.overflow = el.style.whiteSpace = el.style.transform = el.style.marginLeft = ''
    done()
  }, 470)
}
function onLeave(el, done) {
  const w = el.scrollWidth
  el.style.overflow = 'hidden'
  el.style.whiteSpace = 'nowrap'
  el.style.transition = 'none'
  el.style.maxWidth = w + 'px'
  el.style.opacity = '1'
  el.style.transform = 'scaleX(1)'
  el.style.marginLeft = '0px'
  void el.offsetWidth
  el.style.transition = `max-width 0.45s ${CURVA}, opacity 0.35s ease, transform 0.45s ${CURVA}, margin-left 0.45s ${CURVA}`
  el.style.maxWidth = '0px'
  el.style.opacity = '0'
  el.style.transform = 'scaleX(0.4)'
  el.style.marginLeft = `-${GAP}`
  setTimeout(done, 470)
}
</script>

<template>
  <!--  Barra SUPERIOR  -->
  <nav class="navbar bg-white border-bottom sticky-top">
    <div class="container">
      <RouterLink class="navbar-brand fw-bold text-primary fs-4 d-flex align-items-center gap-2" to="/">
        <span
          class="d-inline-flex align-items-center justify-content-center bg-primary text-white fw-bold rounded"
          style="width: 32px; height: 32px; font-size: 0.8rem"
        >
          mq
        </span>
        Merqado
      </RouterLink>

      <!-- Enlaces solo en desktop. Cada uno tiene su subrayado que crece/decrece. -->
      <ul class="navbar-nav flex-row gap-4 d-none d-lg-flex align-items-center">
        <li class="nav-item">
          <RouterLink class="nav-link" :class="{ activo: route.path === '/' && !seccionActiva }" to="/" @click="irInicio">
            Inicio
          </RouterLink>
        </li>

        <!-- Nosotros/Valores/Equipo: aparecen/desaparecen con efecto "telón" (JS). -->
        <Transition :css="false" @enter="onEnter" @leave="onLeave">
          <li v-if="route.path === '/'" class="nav-item extras">
            <a class="nav-link" :class="{ activo: seccionActiva === 'nosotros' }" href="#nosotros">Nosotros</a>
            <a class="nav-link" :class="{ activo: seccionActiva === 'valores' }" href="#valores">Valores</a>
            <a class="nav-link" :class="{ activo: seccionActiva === 'equipo' }" href="#equipo">Equipo</a>
          </li>
        </Transition>

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
        <RouterLink
          class="btn btn-primary d-none d-lg-inline-flex"
          :to="sesionActiva ? '/cuenta' : '/login'"
          :aria-label="sesionActiva ? 'Mi cuenta' : 'Iniciar sesión'"
        >
          <img :src="logo" alt="Logo" class="logo" />
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
/* Subrayado por opción: crece desde el centro cuando está activa y se achica al
   dejar de estarlo. Al pasar de una opción a otra, una se achica mientras la otra
   crece → transición fluida, sin medir posiciones (nada de "bumerang" ni lag). */
.nav-link {
  position: relative;
}
.nav-link::after {
  content: '';
  position: absolute;
  left: 50%;
  right: 50%;
  bottom: 0;
  height: 2px;
  background: var(--marca-primary);
  border-radius: 2px;
  transition: left 0.28s ease, right 0.28s ease;
}
.nav-link.activo {
  color: var(--marca-primary);
  font-weight: 600;
}
.nav-link.activo::after {
  left: 0;
  right: 0;
}

/* Grupo Nosotros/Valores/Equipo como una sola unidad flexible. */
.extras {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  white-space: nowrap;
  transform-origin: center;
}

/* Ítem de la barra inferior: gris, y morado cuando la ruta está activa */
.nav-movil {
  color: var(--bs-secondary-color);
}
.nav-movil.router-link-exact-active {
  color: var(--marca-primary);
}
</style>
