<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import AdminLayout from '../../components/AdminLayout.vue'
import { useCategoriasStore } from '../../stores/categorias'

// el mismo store de categorías que consume el catálogo del cliente,
// así lo que el admin crea/edita/elimina se refleja de inmediato en la tienda
const categoriasStore = useCategoriasStore()
const categorias = computed(() => categoriasStore.lista)

const busqueda = ref('')
const modalAbierto = ref(false)
const editando = ref(false)
const idEditando = ref('')
const enviado = ref(false)
const errorGuardar = ref('')

const iconos = ['bi-tag', 'bi-cpu', 'bi-bag', 'bi-house', 'bi-watch', 'bi-controller', 'bi-book', 'bi-heart', 'bi-cart', 'bi-gift']
const form = reactive({ nombre: '', icono: 'bi-tag' })

const filtradas = computed(() =>
  categorias.value.filter((categoria) => categoria.nombre.toLowerCase().includes(busqueda.value.toLowerCase()))
)

onMounted(() => {
  categoriasStore.cargar().catch(() => {})
})

const resetForm = () => Object.assign(form, { nombre: '', icono: 'bi-tag' })

function abrirNueva() {
  resetForm()
  editando.value = false
  idEditando.value = ''
  enviado.value = false
  errorGuardar.value = ''
  modalAbierto.value = true
}

function abrirEditar(categoria) {
  Object.assign(form, { nombre: categoria.nombre, icono: categoria.icono || 'bi-tag' })
  editando.value = true
  idEditando.value = categoria.id
  enviado.value = false
  errorGuardar.value = ''
  modalAbierto.value = true
}

async function guardar() {
  enviado.value = true
  errorGuardar.value = ''
  if (!form.nombre.trim()) return
  try {
    if (editando.value) {
      await categoriasStore.actualizar(idEditando.value, { nombre: form.nombre.trim(), icono: form.icono })
    } else {
      await categoriasStore.agregar({ nombre: form.nombre.trim(), icono: form.icono })
    }
    modalAbierto.value = false
  } catch (error) {
    // El backend rechaza nombres duplicados (409), entonces lo mostramos en el modal.
    errorGuardar.value = error.message
  }
}

async function eliminar(categoria) {
  if (!window.confirm(`¿Eliminar la categoría "${categoria.nombre}"?`)) return
  try {
    await categoriasStore.eliminar(categoria.id)
  } catch (error) {
    //backend impide borrar categorías con productos asociados (409).
    window.alert(error.message)
  }
}
</script>

<template>
  <AdminLayout title="Gestión de categorías" subtitle="Organizá el catálogo creando y editando categorías.">
    <section class="row g-4 mb-4">
      <div class="col-12 col-lg-8">
        <div class="admin-card p-3 d-flex flex-column flex-lg-row gap-3">
          <div class="input-group">
            <span class="input-group-text bg-transparent border-end-0"><i class="bi bi-search"></i></span>
            <input v-model="busqueda" class="form-control border-start-0" placeholder="Buscar categoría" />
          </div>
        </div>
      </div>
      <div class="col-12 col-lg-4">
        <div class="admin-card inventory-stats">
          <div><span>Total</span><strong>{{ categorias.length }}</strong></div>
          <button class="btn btn-primary" @click="abrirNueva"><i class="bi bi-plus-lg me-1"></i>Agregar</button>
        </div>
      </div>
    </section>

    <article class="admin-card overflow-hidden">
      <div class="p-4 border-bottom"><h2 class="h5 fw-bold mb-0">Categorías ({{ filtradas.length }})</h2></div>
      <div class="table-responsive">
        <table class="table align-middle mb-0 inventory-table">
          <thead><tr><th>Categoría</th><th>Identificador</th><th>Productos</th><th class="text-end">Acciones</th></tr></thead>
          <tbody>
            <tr v-for="categoria in filtradas" :key="categoria.id">
              <td>
                <div class="d-flex align-items-center gap-3">
                  <span class="metric-icon metric-primary"><i class="bi" :class="categoria.icono || 'bi-tag'"></i></span>
                  <strong class="small">{{ categoria.nombre }}</strong>
                </div>
              </td>
              <td><span class="category-pill">{{ categoria.id }}</span></td>
              <td>{{ categoria.productos ?? 0 }}</td>
              <td class="text-end text-nowrap">
                <button class="btn btn-sm btn-light me-1" title="Editar" @click="abrirEditar(categoria)"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-sm btn-light text-danger" title="Eliminar" @click="eliminar(categoria)"><i class="bi bi-trash"></i></button>
              </td>
            </tr>
            <tr v-if="!filtradas.length"><td colspan="4" class="text-center py-5 text-secondary">No se encontraron categorías.</td></tr>
          </tbody>
        </table>
      </div>
    </article>

    <div v-if="modalAbierto" class="modal-backdrop-custom">
      <div class="admin-modal">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2 class="h5 fw-bold mb-0">{{ editando ? 'Editar categoría' : 'Nueva categoría' }}</h2>
          <button class="btn-close" @click="modalAbierto = false"></button>
        </div>
        <form @submit.prevent="guardar" novalidate>
          <div class="row g-3">
            <div class="col-12">
              <label class="form-label">Nombre</label>
              <input v-model="form.nombre" class="form-control" :class="{ 'is-invalid': enviado && !form.nombre.trim() }" />
              <div class="invalid-feedback">Ingresá el nombre.</div>
            </div>
            <div class="col-12">
              <label class="form-label">Ícono</label>
              <div class="d-flex flex-wrap gap-2">
                <button
                  v-for="icono in iconos"
                  :key="icono"
                  type="button"
                  class="btn btn-light icon-option"
                  :class="{ 'border-primary text-primary': form.icono === icono }"
                  @click="form.icono = icono"
                >
                  <i class="bi" :class="icono"></i>
                </button>
              </div>
            </div>
            <div v-if="editando" class="col-12">
              <p class="small text-secondary mb-0"><i class="bi bi-info-circle me-1"></i>El identificador (<code>{{ idEditando }}</code>) no cambia porque los productos lo referencian.</p>
            </div>
          </div>
          <p v-if="errorGuardar" class="text-danger small mt-3 mb-0">{{ errorGuardar }}</p>
          <div class="d-flex justify-content-end gap-2 mt-4">
            <button type="button" class="btn btn-light" @click="modalAbierto = false">Cancelar</button>
            <button class="btn btn-primary">Guardar categoría</button>
          </div>
        </form>
      </div>
    </div>
  </AdminLayout>
</template>

<style scoped>
.icon-option {
  width: 44px;
  height: 44px;
  font-size: 1.1rem;
  border: 1px solid var(--bs-border-color);
}
</style>
