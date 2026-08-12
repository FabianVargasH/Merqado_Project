<script setup>
const year = new Date().getFullYear();
</script>

<template>
  <!-- Footer centrado y minimalista, según el prototipo. -->
  <footer class="bg-white border-top py-5 mt-5">
    <div class="container text-center">
      <!-- Logo "mq" + marca -->
      <div class="d-inline-flex align-items-center gap-2 mb-3">
        <span
          class="d-inline-flex align-items-center justify-content-center bg-primary text-white fw-bold rounded"
          style="width: 32px; height: 32px; font-size: 0.8rem"
        >
          mq
        </span>
        <span class="fw-bold fs-5">Merqado</span>
      </div>

      <!-- Tagline -->
      <p class="text-secondary mb-3">Compra fácil, vive mejor. Tu tienda en línea de confianza.</p>


      <p class="text-secondary small mb-0">© {{year}} Merqado. Todos los derechos reservados.</p>
    </div>
  </footer>
</template>