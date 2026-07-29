<script setup>
import { computed, reactive, ref } from 'vue'
import AdminLayout from '../../components/AdminLayout.vue'
import productosIniciales from '../../data/productos.json'
import { formatearColones } from '../../utils/formato'

const productos = ref(productosIniciales.map((producto) => ({ ...producto })))
const busqueda = ref('')
const categoria = ref('')
const modalAbierto = ref(false)
const editando = ref(false)
const indiceEditando = ref(-1)
const enviado = ref(false)
const form = reactive({ nombre: '', marca: '', categoria: '', precio: '', stock: '', imagen: '', descripcion: '' })
const categorias = computed(() => [...new Set(productos.value.map((producto) => producto.categoria))].sort())
const filtrados = computed(() => productos.value.filter((producto) => `${producto.nombre} ${producto.categoria}`.toLowerCase().includes(busqueda.value.toLowerCase()) && (!categoria.value || producto.categoria === categoria.value)))
const bajoStock = computed(() => productos.value.filter((producto) => producto.stock > 0 && producto.stock <= 10).length)
const estado = (stock) => stock === 0 ? 'Agotado' : stock <= 10 ? 'Bajo stock' : 'Disponible'
const resetForm = () => Object.assign(form, { nombre: '', marca: '', categoria: '', precio: '', stock: '', imagen: '', descripcion: '' })
function abrirNuevo() { resetForm(); editando.value = false; indiceEditando.value = -1; enviado.value = false; modalAbierto.value = true }
function abrirEditar(producto) { Object.assign(form, producto); indiceEditando.value = productos.value.findIndex((item) => item.id === producto.id); editando.value = true; enviado.value = false; modalAbierto.value = true }
function guardar() {
  enviado.value = true
  if (!form.nombre.trim() || !form.categoria || Number(form.precio) <= 0 || Number(form.stock) < 0) return
  const producto = { ...form, id: editando.value ? productos.value[indiceEditando.value].id : Date.now(), precio: Number(form.precio), stock: Number(form.stock), precioAnterior: null, descuento: false, calificacion: 0, resenas: 0, destacado: false, etiqueta: null }
  if (editando.value) productos.value.splice(indiceEditando.value, 1, { ...productos.value[indiceEditando.value], ...producto })
  else productos.value.push(producto)
  modalAbierto.value = false
}
function eliminar(id) { if (window.confirm('¿Eliminar este producto del inventario?')) productos.value = productos.value.filter((producto) => producto.id !== id) }
</script>

<template>
  <AdminLayout title="Gestión de inventario" subtitle="Controlá el catálogo y la disponibilidad de productos.">
    <section class="row g-4 mb-4">
      <div class="col-12 col-lg-8"><div class="admin-card p-3 d-flex flex-column flex-lg-row gap-3"><div class="input-group"><span class="input-group-text bg-transparent border-end-0"><i class="bi bi-search"></i></span><input v-model="busqueda" class="form-control border-start-0" placeholder="Buscar por nombre o categoría" /></div><select v-model="categoria" class="form-select inventory-filter"><option value="">Todas las categorías</option><option v-for="item in categorias" :key="item" :value="item">{{ item }}</option></select></div></div>
      <div class="col-12 col-lg-4"><div class="admin-card inventory-stats"><div><span>Total</span><strong>{{ productos.length }}</strong></div><div><span>Bajo stock</span><strong class="text-danger">{{ bajoStock }}</strong></div><button class="btn btn-primary" @click="abrirNuevo"><i class="bi bi-plus-lg me-1"></i>Agregar</button></div></div>
    </section>
    <article class="admin-card overflow-hidden"><div class="p-4 border-bottom"><h2 class="h5 fw-bold mb-0">Productos ({{ filtrados.length }})</h2></div><div class="table-responsive"><table class="table align-middle mb-0 inventory-table"><thead><tr><th>Producto</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Estado</th><th class="text-end">Acciones</th></tr></thead><tbody><tr v-for="producto in filtrados" :key="producto.id"><td><div class="d-flex align-items-center gap-3"><img :src="producto.imagen" :alt="producto.nombre" class="inventory-image" /><div><strong class="small d-block">{{ producto.nombre }}</strong><span class="small text-secondary">{{ producto.marca }}</span></div></div></td><td><span class="category-pill">{{ producto.categoria }}</span></td><td class="fw-semibold">{{ formatearColones(producto.precio) }}</td><td>{{ producto.stock }}</td><td><span class="status-pill" :class="{ 'status-danger': producto.stock === 0, 'status-warning': producto.stock > 0 && producto.stock <= 10 }">{{ estado(producto.stock) }}</span></td><td class="text-end text-nowrap"><button class="btn btn-sm btn-light me-1" title="Editar" @click="abrirEditar(producto)"><i class="bi bi-pencil"></i></button><button class="btn btn-sm btn-light text-danger" title="Eliminar" @click="eliminar(producto.id)"><i class="bi bi-trash"></i></button></td></tr><tr v-if="!filtrados.length"><td colspan="6" class="text-center py-5 text-secondary">No se encontraron productos.</td></tr></tbody></table></div></article>

    <div v-if="modalAbierto" class="modal-backdrop-custom"><div class="admin-modal"><div class="d-flex justify-content-between align-items-center mb-4"><h2 class="h5 fw-bold mb-0">{{ editando ? 'Editar producto' : 'Nuevo producto' }}</h2><button class="btn-close" @click="modalAbierto = false"></button></div><form @submit.prevent="guardar" novalidate><div class="row g-3"><div class="col-12"><label class="form-label">Nombre</label><input v-model="form.nombre" class="form-control" :class="{ 'is-invalid': enviado && !form.nombre.trim() }" /><div class="invalid-feedback">Ingresá el nombre.</div></div><div class="col-md-6"><label class="form-label">Marca</label><input v-model="form.marca" class="form-control" /></div><div class="col-md-6"><label class="form-label">Categoría</label><input v-model="form.categoria" class="form-control" :class="{ 'is-invalid': enviado && !form.categoria }" /><div class="invalid-feedback">Ingresá la categoría.</div></div><div class="col-md-6"><label class="form-label">Precio</label><input v-model="form.precio" type="number" min="1" class="form-control" :class="{ 'is-invalid': enviado && Number(form.precio) <= 0 }" /></div><div class="col-md-6"><label class="form-label">Stock</label><input v-model="form.stock" type="number" min="0" class="form-control" :class="{ 'is-invalid': enviado && Number(form.stock) < 0 }" /></div><div class="col-12"><label class="form-label">URL de imagen</label><input v-model="form.imagen" class="form-control" /></div><div class="col-12"><label class="form-label">Descripción</label><textarea v-model="form.descripcion" class="form-control" rows="2"></textarea></div></div><div class="d-flex justify-content-end gap-2 mt-4"><button type="button" class="btn btn-light" @click="modalAbierto = false">Cancelar</button><button class="btn btn-primary">Guardar producto</button></div></form></div></div>
  </AdminLayout>
</template>
