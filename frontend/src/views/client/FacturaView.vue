<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePedidosStore } from '../../stores/pedidos'
import { formatearColones } from '../../utils/formato'

// Factura del cliente: renderiza una orden con formato de comprobante e
// imprimible (Imprimir → Guardar como PDF desde el navegador). why: cumple con
// "generar un tipo de factura" reusando los datos que ya guarda la orden.
const route = useRoute()
const router = useRouter()
const pedidos = usePedidosStore()

const orden = ref(null)
const cargando = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    orden.value = await pedidos.cargarPorNumero(route.params.numero)
  } catch (e) {
    error.value = e.message || 'No se pudo cargar la factura'
  } finally {
    cargando.value = false
  }
})

const fecha = computed(() => {
  const d = new Date(orden.value?.fecha || orden.value?.createdAt)
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString('es-CR', { day: '2-digit', month: 'long', year: 'numeric' })
})
const envioGratis = computed(() => !orden.value?.envio)

function imprimir() {
  window.print()
}
</script>

<template>
  <div class="container py-4 factura-wrap" style="max-width: 760px">
    <div v-if="cargando" class="text-center py-5 text-secondary">Cargando factura…</div>

    <div v-else-if="error" class="text-center py-5">
      <i class="bi bi-exclamation-circle text-danger" style="font-size: 2.5rem"></i>
      <p class="text-secondary mt-2">{{ error }}</p>
      <RouterLink to="/cuenta" class="btn btn-primary btn-sm">Volver a mi cuenta</RouterLink>
    </div>

    <template v-else-if="orden">
      <!-- Acciones (no se imprimen) -->
      <div class="d-flex justify-content-between align-items-center mb-4 no-print">
        <button class="btn btn-outline-secondary btn-sm" @click="router.back()">
          <i class="bi bi-arrow-left me-1"></i> Volver
        </button>
        <button class="btn btn-primary btn-sm" @click="imprimir">
          <i class="bi bi-printer me-1"></i> Imprimir / Guardar PDF
        </button>
      </div>

      <!-- Documento de la factura -->
      <article class="card border shadow-sm factura">
        <div class="card-body p-4">
          <!-- Encabezado -->
          <div class="d-flex justify-content-between align-items-start flex-wrap gap-3 border-bottom pb-4 mb-4">
            <div class="d-flex align-items-center gap-2">
              <span class="d-inline-flex align-items-center justify-content-center bg-primary text-white fw-bold rounded" style="width: 44px; height: 44px">mq</span>
              <div>
                <h1 class="h4 fw-bold mb-0 text-primary">Merqado</h1>
                <p class="small text-secondary mb-0">Comercio electrónico</p>
              </div>
            </div>
            <div class="text-end">
              <h2 class="h5 fw-bold mb-1">Factura</h2>
              <p class="small text-secondary mb-0">N.º <strong>{{ orden.numero }}</strong></p>
              <p class="small text-secondary mb-0">{{ fecha }}</p>
            </div>
          </div>

          <!-- Datos del cliente y envío -->
          <div class="row g-4 mb-4">
            <div class="col-sm-6">
              <p class="text-uppercase small fw-semibold text-secondary mb-1">Facturar a</p>
              <p class="mb-0 fw-semibold">{{ orden.shipping?.nombre }} {{ orden.shipping?.apellidos }}</p>
              <p class="mb-0 small text-secondary" v-if="orden.usuario">{{ orden.usuario }}</p>
            </div>
            <div class="col-sm-6 text-sm-end">
              <p class="text-uppercase small fw-semibold text-secondary mb-1">Enviar a</p>
              <p class="mb-0 small">{{ orden.shipping?.direccion }}</p>
              <p class="mb-0 small text-secondary">
                {{ orden.shipping?.distrito }}, {{ orden.shipping?.canton }}, {{ orden.shipping?.provincia }} — {{ orden.shipping?.codigoPostal }}
              </p>
            </div>
          </div>

          <!-- Detalle de productos -->
          <div class="table-responsive">
            <table class="table align-middle">
              <thead class="table-light">
                <tr>
                  <th>Producto</th>
                  <th class="text-center">Cant.</th>
                  <th class="text-end">Precio</th>
                  <th class="text-end">Importe</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in orden.items" :key="item.productId ?? item.id">
                  <td>{{ item.nombre }}</td>
                  <td class="text-center">{{ item.cantidad }}</td>
                  <td class="text-end">{{ formatearColones(item.precio) }}</td>
                  <td class="text-end">{{ formatearColones(item.precio * item.cantidad) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Totales -->
          <div class="d-flex justify-content-end">
            <div style="min-width: 260px">
              <!-- Desglose fiscal: subtotal (base sin IVA) + I.V.A. 13% + envío = total. -->
              <div class="d-flex justify-content-between mb-2">
                <span class="text-secondary">Subtotal</span>
                <span>{{ formatearColones(orden.subtotal) }}</span>
              </div>
              <div class="d-flex justify-content-between mb-2">
                <span class="text-secondary">I.V.A. (13%)</span>
                <span>{{ formatearColones(orden.iva) }}</span>
              </div>
              <div class="d-flex justify-content-between mb-2">
                <span class="text-secondary">Envío</span>
                <span :class="{ 'text-success': envioGratis }">{{ envioGratis ? 'Gratis' : formatearColones(orden.envio) }}</span>
              </div>
              <hr />
              <div class="d-flex justify-content-between fw-bold fs-5 mb-0">
                <span>Total</span>
                <span class="text-primary">{{ formatearColones(orden.total) }}</span>
              </div>
            </div>
          </div>

          <!-- Pago y estado -->
          <div class="border-top mt-4 pt-4 d-flex justify-content-between flex-wrap gap-3">
            <div v-if="orden.payment">
              <p class="text-uppercase small fw-semibold text-secondary mb-1">Pago</p>
              <p class="small mb-0">Referencia: <strong>{{ orden.payment.referencia }}</strong></p>
              <p class="small mb-0">Método: tarjeta · <span class="text-success">{{ orden.payment.autorizado ? 'Autorizado' : 'Rechazado' }}</span></p>
            </div>
            <div class="text-sm-end">
              <p class="text-uppercase small fw-semibold text-secondary mb-1">Estado del pedido</p>
              <span class="badge bg-primary-subtle text-primary-emphasis">{{ orden.estado }}</span>
            </div>
          </div>

          <p class="text-center small text-secondary mt-4 mb-0">
            Gracias por tu compra en Merqado.
          </p>
        </div>
      </article>
    </template>
  </div>
</template>

<style scoped>
/* Fuente general un poco más pequeña para que la factura quepa en una sola página
   al guardar como PDF. Los tamaños relativos hacen que títulos y tablas escalen. */
.factura {
  font-size: 0.82rem;
}
.factura :deep(h1) {
  font-size: 1.15rem;
}
.factura :deep(h2) {
  font-size: 0.95rem;
}
.factura :deep(.fs-5) {
  font-size: 1rem !important;
}
.factura :deep(.table) {
  font-size: 0.82rem;
}
/* Márgenes de impresión ajustados para aprovechar la página. */
@media print {
  @page {
    margin: 12mm;
  }
}
</style>
