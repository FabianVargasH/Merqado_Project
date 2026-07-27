<script setup>
const year = new Date().getFullYear();
</script>

<template>
  <!-- Usamos Grid responsive de Bootstrappara mostrar 1 columna en celular, y 4 en desktop -->
  <footer class="bg-white border-top pt-5 pb-4 mt-5">
    <div class="container">
      <div class="row g-4">
        <div class="col-md-4">
          <span class="fw-bold fs-5">Merqado</span>
          <p class="text-secondary mt-2">
            Comercio en línea de Costa Rica. Productos seleccionados con una
            experiencia de compra simple y segura.
          </p>
        </div>
        <div class="col-6 col-md-3">
          <h6 class="fw-bold">Tienda</h6>
          <ul class="list-unstyled">
            <li><RouterLink class="link-secondary text-decoration-none" to="/catalogo">Novedades</RouterLink></li>
            <li><RouterLink class="link-secondary text-decoration-none" to="/catalogo">Más vendidos</RouterLink></li>
            <li><RouterLink class="link-secondary text-decoration-none" to="/catalogo">Categorías</RouterLink></li>
          </ul>
        </div>
        <div class="col-6 col-md-2">
          <h6 class="fw-bold">Soporte</h6>
          <ul class="list-unstyled">
            <li><a class="link-secondary text-decoration-none" href="#">Seguir pedido</a></li>
            <li><a class="link-secondary text-decoration-none" href="#">Devoluciones</a></li>
            <li><a class="link-secondary text-decoration-none" href="#">Contacto</a></li>
          </ul>
        </div>
        <div class="col-md-3">
          <h6 class="fw-bold">Boletín</h6>
          <p class="text-secondary small">Recibí ofertas exclusivas.</p>
          <div class="input-group">
            <input type="email" class="form-control" placeholder="Correo" aria-label="Correo" />
            <button class="btn btn-primary"><i class="bi bi-send"></i></button>
          </div>
        </div>
      </div>
      <hr />
      <p class="text-center text-secondary small mb-0">
        © {{ year }} Merqado. Todos los derechos reservados.
      </p>
    </div>
  </footer>
</template>