<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import fabianPic from '../../assets/fabian-pic.png'
import joaquinPic from '../../assets/joaquin-pic.png'
import kendraPic from '../../assets/kendra-pic.png'

// Parallax sutil de la imagen del hero al hacer scroll
const heroImagen = ref(null)

function manejarScrollParallax() {
  if (!heroImagen.value) return
  const scrolled = window.pageYOffset
  heroImagen.value.style.transform = `translateY(${scrolled * 0.05}px) rotate(3deg)`
}

onMounted(() => {
  window.addEventListener('scroll', manejarScrollParallax)
})
onUnmounted(() => {
  window.removeEventListener('scroll', manejarScrollParallax)
})

const equipo = [
  { nombre: 'Joaquín Pappa', rol: 'Desarrollador Full Stack', foto: joaquinPic },
  { nombre: 'Kendra Sancho Vega', rol: 'Desarrolladora Full Stack', foto: kendraPic },
  { nombre: 'Fabián Vargas', rol: 'Desarrollador Full Stack', foto: fabianPic },
]

const valores = [
  { icono: 'bi-shield-check', titulo: 'Confianza', texto: 'Generar en el usuario la certeza de que sus datos y transacciones están protegidos en todo momento.' },
  { icono: 'bi-lightning-charge', titulo: 'Inclusión', texto: 'Asegurar que la plataforma sea usable por personas con distintos niveles de experiencia tecnológica y desde cualquier dispositivo.' },
  { icono: 'bi-heart', titulo: 'Compromiso', texto: 'Mantener un estándar de calidad constante en el desarrollo, la presentación y la gestión del sistema.' },
  { icono: 'bi-stars', titulo: 'Innovación', texto: 'Mejorar siempre para ofrecer lo mejor para sus necesidades.' },
]
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
            <RouterLink to="/catalogo" class="btn btn-primary btn-lg btn-interactivo">Explorar productos</RouterLink>
            <a href="#nosotros" class="btn btn-outline-secondary btn-lg btn-interactivo">Conócenos</a>
          </div>
        </div>
        <div class="col-lg-6">
          <img
            ref="heroImagen"
            src="../../assets/hero-img.png"
            class="img-fluid rounded-4 shadow"
            alt="Productos destacados"
          />
        </div>
      </div>
    </div>
  </section>

  <!-- MISIÓN Y VISIÓN -->
  <section id="nosotros" class="py-5 bg-body-tertiary">
    <div class="container py-3">
      <div class="text-center mb-5">
        <span class="text-primary text-uppercase fw-semibold small">Quiénes somos</span>
        <h2 class="fw-bold">Nuestro propósito</h2>
      </div>
      <div class="row g-4 justify-content-center">
        <div class="col-md-6 col-lg-5">
          <div class="card border-0 shadow-sm h-100 text-center p-4">
            <div class="card-body">
              <div class="icono-caja mb-3">
                <i class="bi bi-bullseye fs-3"></i>
              </div>
              <h3 class="h4 fw-bold mb-2">Misión</h3>
              <p class="text-secondary mb-0">
                Brindar a clientes y administradores una plataforma de comercio electrónico intuitiva y segura, que facilite la gestión de productos, categorías e inventario, y que garantice un proceso de compra transparente, validado y adaptado a distintos dispositivos y perfiles de usuario.
              </p>
            </div>
          </div>
        </div>
        <div class="col-md-6 col-lg-5">
          <div class="card border-0 shadow-sm h-100 text-center p-4">
            <div class="card-body">
              <div class="icono-caja mb-3">
                <i class="bi bi-eye fs-3"></i>
              </div>
              <h3 class="h4 fw-bold mb-2">Visión</h3>
              <p class="text-secondary mb-0">
                Posicionarse como una solución de comercio electrónico que evolucione de forma continua para anticipar las necesidades del mercado digital, garantizando en todo momento una experiencia de compra responsiva, segura y accesible para cualquier 
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- VALORES -->
  <section id="valores" class="py-5">
    <div class="container py-3">
      <div class="text-center mb-5">
        <span class="text-primary text-uppercase fw-semibold small">Lo que nos define</span>
        <h2 class="fw-bold">Nuestros valores</h2>
      </div>
      <div class="row g-4 text-center">
        <div v-for="valor in valores" :key="valor.titulo" class="col-6 col-lg-3">
          <div class="card border h-100 p-4">
            <div class="card-body">
              <div class="icono-caja icono-caja--valor mb-3">
                <i class="bi fs-5" :class="valor.icono"></i>
              </div>
              <h3 class="h6 fw-bold mb-2">{{ valor.titulo }}</h3>
              <p class="text-secondary small mb-0">{{ valor.texto }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- EQUIPO -->
  <section id="equipo" class="py-5 bg-body-tertiary">
    <div class="container py-3">
      <div class="text-center mb-5">
        <h2 class="fw-bold">Nuestro Equipo</h2>
        <p class="lead text-secondary">Las mentes brillantes que hacen posible la experiencia Merqado.</p>
      </div>
      <div class="row g-4 justify-content-center">
        <div v-for="persona in equipo" :key="persona.nombre" class="col-12 col-sm-4 text-center">
          <img
            :src="persona.foto"
            :alt="`${persona.nombre} - ${persona.rol}`"
            class="img-fluid rounded-4 mb-3 border"
            style="aspect-ratio: 1 / 1; object-fit: cover; width: 100%"
          />
          <h4 class="h5 fw-bold mb-1">{{ persona.nombre }}</h4>
          <p class="text-primary fw-semibold small mb-0">{{ persona.rol }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.btn-interactivo {
  transition: transform 0.1s ease;
}
.btn-interactivo:active {
  transform: scale(0.95);
}

/* Círculo de ícono para Misión/Visión */
.icono-caja {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 1rem;
  background-color: var(--bs-primary);
  color: #fff;
}

/* Variante más pequeña, usada en Valores */
.icono-caja--valor {
  width: 48px;
  height: 48px;
  border-radius: 0.75rem;
}
</style>