<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import ProductCard from '../../components/ProductCard.vue'
import { useProductosStore } from '../../stores/productos'
import { useCategoriasStore } from '../../stores/categorias'
import { formatearColones } from '../../utils/formato'

const route = useRoute()
// Productos desde el store (fuente única, refleja stock y ediciones del admin).
const productosStore = useProductosStore()
const productos = productosStore.lista

const categoriasStore = useCategoriasStore()
const categorias = computed(() => categoriasStore.lista)
onMounted(() => {
  // Recarga al entrar al catálogo para reflejar stock/ediciones del admin sin
  // tener que refrescar toda la app.
  productosStore.cargar().catch(() => {})
  if (!categoriasStore.lista.length) categoriasStore.cargar().catch(() => {})
})

// Precio más alto del catálogo → tope del deslizador de precio.
const precioTope = computed(() => Math.max(0, ...productos.map((p) => p.precio)))

// Estado de los filtros y la vista.
const busqueda = ref('')
const categoriasSeleccionadas = ref([])
const soloOfertas = ref(false)
const precioMax = ref(0)
const orden = ref('destacados')
const paginaActual = ref(1)
const porPagina = 6

watch(precioTope, (value) => {
  if (precioMax.value === 0) precioMax.value = value
}, { immediate: true })

// esta funcion inicializa filtros desde la URL, por ejemplo, los enlaces del NavBar/Inicio traen ?categoria= o ?descuento=true, por lo que
// se re-aplica si la query cambia en la misma vista
function aplicarQuery() {
  categoriasSeleccionadas.value = route.query.categoria ? [String(route.query.categoria)] : []
  soloOfertas.value = route.query.descuento === 'true'
}
aplicarQuery()
watch(() => route.query, aplicarQuery)

// Al cambiar cualquier filtro, volver a la primera página para evitar quedar en una página vacía
watch(
  [busqueda, categoriasSeleccionadas, soloOfertas, precioMax, orden],
  () => (paginaActual.value = 1),
  { deep: true }
)

// Filtrado + orden
// con computed se recalcula solo cuando un filtro cambia
const filtrados = computed(() => {
  const texto = busqueda.value.toLowerCase().trim()
  const lista = productos.filter((p) => {
    const coincideTexto = p.nombre.toLowerCase().includes(texto)
    const coincideCat =
      !categoriasSeleccionadas.value.length || categoriasSeleccionadas.value.includes(p.categoria)
    const coincideOferta = !soloOfertas.value || p.descuento
    const coincidePrecio = precioMax.value === 0 || p.precio <= precioMax.value
    return coincideTexto && coincideCat && coincideOferta && coincidePrecio
  })

  // Copia antes de ordenar para no mutar el arreglo importado
  const copia = [...lista]
  if (orden.value === 'precio-asc') copia.sort((a, b) => a.precio - b.precio)
  else if (orden.value === 'precio-desc') copia.sort((a, b) => b.precio - a.precio)
  else if (orden.value === 'calificacion') copia.sort((a, b) => b.calificacion - a.calificacion)
  return copia
})

const totalPaginas = computed(() => Math.max(1, Math.ceil(filtrados.value.length / porPagina)))
const paginados = computed(() => {
  const inicio = (paginaActual.value - 1) * porPagina
  return filtrados.value.slice(inicio, inicio + porPagina)
})

function limpiar() {
  busqueda.value = ''
  categoriasSeleccionadas.value = []
  soloOfertas.value = false
  precioMax.value = precioTope.value
  orden.value = 'destacados'
}
</script>

<template>
  <div class="container py-4">
    <div class="row g-4">
      <!--  Sidebar de filtros (arriba en ceclular, lateral en desktop)  -->
      <aside class="col-12 col-lg-3">
        <div class="card border" style="position: sticky; top: 90px">
          <div class="card-body">
            <h2 class="h6 fw-bold mb-3">Filtros</h2>

            <!-- Búsqueda -->
            <div class="mb-3">
              <label class="form-label small text-secondary">Buscar</label>
              <input
                v-model="busqueda"
                type="text"
                class="form-control form-control-sm"
                placeholder="Nombre del producto…"
              />
            </div>

            <!-- Categorías -->
            <div class="mb-3">
              <label class="form-label small text-secondary">Categorías</label>
              <div v-for="cat in categorias" :key="cat.id" class="form-check">
                <input
                  :id="'cat-' + cat.id"
                  v-model="categoriasSeleccionadas"
                  :value="cat.id"
                  type="checkbox"
                  class="form-check-input"
                />
                <label class="form-check-label" :for="'cat-' + cat.id">{{ cat.nombre }}</label>
              </div>
            </div>

            <!-- Solo ofertas -->
            <div class="form-check form-switch mb-3">
              <input id="ofertas" v-model="soloOfertas" type="checkbox" class="form-check-input" />
              <label class="form-check-label" for="ofertas">Solo ofertas</label>
            </div>

            <!-- Precio máximo -->
            <div class="mb-3">
              <label class="form-label small text-secondary d-flex justify-content-between">
                <span>Precio máx.</span>
                <span class="text-primary fw-semibold">{{ formatearColones(precioMax) }}</span>
              </label>
              <input
                v-model.number="precioMax"
                type="range"
                class="form-range"
                min="0"
                :max="precioTope"
                step="5000"
              />
            </div>

            <button class="btn btn-outline-secondary btn-sm w-100" @click="limpiar">
              Limpiar filtros
            </button>
          </div>
        </div>
      </aside>

      <!-- ══ grid de productos ══ -->
      <main class="col-12 col-lg-9">
        <!-- Encabezado: cantidad + orden -->
        <div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-4">
          <div>
            <h1 class="h4 fw-bold mb-0">Catálogo</h1>
            <p class="text-secondary small mb-0">{{ filtrados.length }} producto(s) encontrados</p>
          </div>
          <div class="d-flex align-items-center gap-2">
            <label class="small text-secondary mb-0">Ordenar:</label>
            <select v-model="orden" class="form-select form-select-sm" style="width: auto">
              <option value="destacados">Destacados</option>
              <option value="precio-asc">Precio: menor a mayor</option>
              <option value="precio-desc">Precio: mayor a menor</option>
              <option value="calificacion">Mejor calificación</option>
            </select>
          </div>
        </div>

        <!-- Si no hay productos que coincidan con los filtros -->
        <div v-if="!filtrados.length" class="text-center text-secondary py-5">
          <i class="bi bi-search" style="font-size: 2.5rem"></i>
          <p class="mt-2">No hay productos que coincidan con los filtros.</p>
          <button class="btn btn-primary btn-sm" @click="limpiar">Limpiar filtros</button>
        </div>

        <!-- grid -->
        <div v-else class="row g-3">
          <div v-for="p in paginados" :key="p.id" class="col-6 col-md-4">
            <ProductCard :producto="p" />
          </div>
        </div>

        <!-- Paginación -->
        <nav v-if="totalPaginas > 1" class="mt-4 d-flex justify-content-center">
          <ul class="pagination mb-0">
            <li class="page-item" :class="{ disabled: paginaActual === 1 }">
              <button class="page-link" @click="paginaActual--"><i class="bi bi-chevron-left"></i></button>
            </li>
            <li
              v-for="n in totalPaginas"
              :key="n"
              class="page-item"
              :class="{ active: n === paginaActual }"
            >
              <button class="page-link" @click="paginaActual = n">{{ n }}</button>
            </li>
            <li class="page-item" :class="{ disabled: paginaActual === totalPaginas }">
              <button class="page-link" @click="paginaActual++"><i class="bi bi-chevron-right"></i></button>
            </li>
          </ul>
        </nav>
      </main>
    </div>
  </div>
</template>
