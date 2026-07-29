<!-- src/components/PanelAuthVisual.vue -->
<script setup>
// Panel visual compartido entre LoginView y RegistroView (solo desktop).
// El headline es lo único que difiere entre ambas vistas, por eso va en un slot.
</script>

<template>
  <div class="col-lg-6 d-none d-lg-flex flex-column justify-content-between position-relative overflow-hidden panel-visual p-5">
    <div class="blob blob--1"></div>
    <div class="blob blob--2"></div>

    <RouterLink to="/" class="d-inline-flex align-items-center gap-2 text-decoration-none position-relative">
      <span
        class="d-inline-flex align-items-center justify-content-center bg-white text-primary fw-bold rounded-3"
        style="width: 36px; height: 36px"
      >
        mq
      </span>
      <span class="fw-bold fs-5 text-white">Merqado</span>
    </RouterLink>

    <div class="position-relative text-white">
      <h2 class="display-6 fw-bold mb-4"><slot name="headline" /></h2>

      <div class="d-flex align-items-center gap-3">
        <div class="d-flex">
          <span class="avatar-mini">A</span>
          <span class="avatar-mini">M</span>
          <span class="avatar-mini">J</span>
        </div>
        <span class="small opacity-75">Más de 10 000 compradores confían en Merqado</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel-visual {
  background: linear-gradient(160deg, #6d5bf7 0%, #4b3df5 45%, #3423c9 100%);
}
.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(70px);
  opacity: 0.55;
}
.blob--1 {
  width: 280px;
  height: 280px;
  background: #a48bff;
  top: -60px;
  right: -60px;
}
.blob--2 {
  width: 320px;
  height: 320px;
  background: #241a99;
  bottom: -100px;
  left: -80px;
}
.avatar-mini {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  border: 2px solid rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
  margin-left: -8px;
}
.avatar-mini:first-child {
  margin-left: 0;
}
</style>