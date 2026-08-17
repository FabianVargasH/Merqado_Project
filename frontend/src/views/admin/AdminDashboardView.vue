<script setup>
import { computed, onMounted, reactive } from 'vue'
import AdminLayout from '../../components/AdminLayout.vue'
import { usePedidosStore } from '../../stores/pedidos'
import { useProductosStore } from '../../stores/productos'
import { formatearColones } from '../../utils/formato'

const pedidos = usePedidosStore()
const productos = useProductosStore().lista

onMounted(() => {
  pedidos.cargarAdminPedidos().catch(() => {})
})

// Cambio de estado en dos pasos: elegir en el <select> solo prepara el cambio;
// se aplica al confirmar con el botón. why: evita cambiar el estado de una orden
// por un clic accidental en el desplegable.
const estadoPendiente = reactive({})
const guardandoEstado = reactive({})
function seleccionarEstado(numero, valor) {
  estadoPendiente[numero] = valor
}
function estadoSeleccionado(pedido) {
  return estadoPendiente[pedido.numero] ?? pedido.estado
}
function hayCambioEstado(pedido) {
  return estadoPendiente[pedido.numero] != null && estadoPendiente[pedido.numero] !== pedido.estado
}
async function confirmarEstado(pedido) {
  if (!hayCambioEstado(pedido)) return
  guardandoEstado[pedido.numero] = true
  try {
    await pedidos.cambiarEstado(pedido.numero, estadoPendiente[pedido.numero])
    delete estadoPendiente[pedido.numero]
  } finally {
    delete guardandoEstado[pedido.numero]
  }
}

// Estados que el admin puede asignar + formateo de la fecha ISO del pedido.
const estadosPedido = ['Procesando', 'En camino', 'Entregado', 'Cancelado']
const fmtFecha = (valor) => {
  const d = new Date(valor)
  // Pedidos viejos guardaban la fecha ya formateada (no ISO); en ese caso la mostramos tal cual.
  return isNaN(d.getTime()) ? valor : d.toLocaleDateString('es-CR', { day: 'numeric', month: 'short', year: 'numeric' })
}
const totalVentas = computed(() => pedidos.lista.reduce((total, pedido) => total + Number(pedido.total || 0), 0))
const productosVendidos = computed(() => pedidos.lista.reduce((total, pedido) => total + (pedido.items || []).reduce((n, item) => n + Number(item.cantidad || 0), 0), 0))
const ordenesRecientes = computed(() => pedidos.lista.slice(0, 5))
const destacados = computed(() => {
  const cantidades = new Map()
  // Los ítems de orden del backend identifican el producto con `productId`.
  pedidos.lista.forEach((pedido) => (pedido.items || []).forEach((item) => {
    const pid = item.productId ?? item.id
    cantidades.set(pid, (cantidades.get(pid) || 0) + Number(item.cantidad || 0))
  }))
  return productos.map((producto) => ({ ...producto, vendidos: cantidades.get(producto.id) || 0 })).sort((a, b) => b.vendidos - a.vendidos).slice(0, 4)
})
const promedio = computed(() => pedidos.lista.length ? totalVentas.value / pedidos.lista.length : 0)
</script>

<template>
  <AdminLayout title="Resumen" subtitle="Esto es lo que está ocurriendo en Merqado hoy.">
    <section class="row g-4 mb-4">
      <div v-for="metric in [
        { label: 'Ventas totales', value: formatearColones(totalVentas), icon: 'bi-cash-stack', trend: '+12.5%', color: 'primary' },
        { label: 'Pedidos', value: pedidos.lista.length, icon: 'bi-bag-check', trend: '+8.2%', color: 'secondary' },
        { label: 'Ticket promedio', value: formatearColones(promedio), icon: 'bi-graph-up-arrow', trend: '+2.1%', color: 'tertiary' },
        { label: 'Productos vendidos', value: productosVendidos, icon: 'bi-box-seam', trend: '+15.3%', color: 'primary' }
      ]" :key="metric.label" class="col-12 col-sm-6 col-xl-3">
        <article class="admin-card h-100 p-4">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <span class="metric-icon" :class="`metric-${metric.color}`"><i class="bi" :class="metric.icon"></i></span>
            <span class="trend-badge"><i class="bi bi-trending-up"></i> {{ metric.trend }}</span>
          </div>
          <p class="small text-secondary mb-1">{{ metric.label }}</p>
          <h2 class="h4 fw-bold mb-0">{{ metric.value }}</h2>
        </article>
      </div>
    </section>

    <div class="row g-4">
      <section class="col-12 col-xl-8">
        <article class="admin-card overflow-hidden">
          <div class="p-4 border-bottom d-flex justify-content-between align-items-center">
            <h2 class="h5 fw-bold mb-0">Órdenes recientes</h2>
            <span class="small text-secondary">Últimas 5</span>
          </div>
          <div v-if="!ordenesRecientes.length" class="empty-state m-4"><i class="bi bi-inbox"></i><p>No hay órdenes registradas todavía.</p></div>
          <div v-else class="table-responsive">
            <table class="table align-middle mb-0">
              <thead><tr><th>Orden</th><th>Cliente</th><th>Fecha</th><th>Estado</th><th class="text-end">Monto</th></tr></thead>
              <tbody><tr v-for="pedido in ordenesRecientes" :key="pedido.numero"><td class="fw-semibold">#{{ pedido.numero }}</td><td class="small">{{ pedido.usuarioRef?.nombre || pedido.usuario || '—' }}</td><td>{{ fmtFecha(pedido.fecha || pedido.createdAt) }}</td><td><div class="d-flex align-items-center gap-2"><select class="form-select form-select-sm" style="min-width: 130px" :value="estadoSeleccionado(pedido)" @change="seleccionarEstado(pedido.numero, $event.target.value)"><option v-for="e in estadosPedido" :key="e" :value="e">{{ e }}</option></select><button v-if="hayCambioEstado(pedido)" class="btn btn-sm btn-primary" :disabled="guardandoEstado[pedido.numero]" title="Confirmar cambio de estado" @click="confirmarEstado(pedido)"><i class="bi bi-check-lg"></i></button></div></td><td class="text-end fw-bold">{{ formatearColones(pedido.total) }}</td></tr></tbody>
            </table>
          </div>
        </article>
      </section>
      <section class="col-12 col-xl-4">
        <article class="admin-card h-100">
          <div class="p-4 border-bottom"><h2 class="h5 fw-bold mb-0">Productos más vendidos</h2></div>
          <div class="p-4 d-flex flex-column gap-3">
            <div v-for="producto in destacados" :key="producto.id" class="d-flex align-items-center gap-3">
              <img :src="producto.imagen" :alt="producto.nombre" class="top-product-image" />
              <div class="flex-grow-1 min-width-0"><strong class="small d-block text-truncate">{{ producto.nombre }}</strong><span class="small text-secondary">{{ producto.vendidos }} vendidos</span></div>
              <span class="small fw-bold">{{ formatearColones(producto.precio) }}</span>
            </div>
          </div>
        </article>
      </section>
    </div>
  </AdminLayout>
</template>
