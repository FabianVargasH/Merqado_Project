<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { usePedidosStore } from '../../stores/pedidos'
import { useUbicacionesStore } from '../../stores/ubicaciones'
import { formatearColones } from '../../utils/formato'
import { addressesApi } from '../../services/addresses'
import { obtenerUsuario, cerrarSesion, actualizarPerfil } from '../../utils/auth'

const router = useRouter()
const pedidosStore = usePedidosStore()
const ubicaciones = useUbicacionesStore()

const usuario = ref(obtenerUsuario())

// Solo los pedidos de ESTE usuario (por correo) traídos de la base.
const misPedidos = computed(() => pedidosStore.lista.filter((p) => p.usuario === usuario.value?.correo))

onMounted(async () => {
  // Sin sesión simulada no hay datos de cuenta que mostrar entonces los mandamos a login
  if (!usuario.value) {
    router.replace({ name: 'login' })
    return
  }
  await Promise.allSettled([
    pedidosStore.cargarMisPedidos(),
    cargarDirecciones(),
    ubicaciones.cargarProvincias(),
  ])
})

const tabActiva = ref('pedidos')
function cambiarTab(tab) {
  tabActiva.value = tab
}

// Número del pedido cuyo detalle está expandido (null = ninguno).
const pedidoAbierto = ref(null)
function alternarDetalle(numero) {
  pedidoAbierto.value = pedidoAbierto.value === numero ? null : numero
}

const inicial = computed(() => (usuario.value?.nombre?.[0] || '?').toUpperCase())

const clienteDesde = computed(() => {
  if (!usuario.value?.ingresoEn) return ''
  return new Date(usuario.value.ingresoEn).toLocaleDateString('es-CR', {
    year: 'numeric',
    month: 'long',
  })
})

function formatearFecha(fecha) {
  const d = new Date(fecha)
  // Pedidos viejos guardaban la fecha ya formateada (no ISO); en ese caso la mostramos tal cual.
  return isNaN(d.getTime()) ? fecha : d.toLocaleDateString('es-CR', { year: 'numeric', month: 'short', day: 'numeric' })
}

function claseEstado(estado) {
  const mapa = {
    entregado: 'bg-success-subtle text-success-emphasis',
    'en camino': 'bg-primary-subtle text-primary-emphasis',
    procesando: 'bg-warning-subtle text-warning-emphasis',
    cancelado: 'bg-danger-subtle text-danger-emphasis',
  }
  return mapa[estado?.toLowerCase()] || 'bg-secondary-subtle text-secondary-emphasis'
}

// --- Datos personales ---
const datosPersonales = reactive({
  nombre: usuario.value?.nombre ?? '',
  correo: usuario.value?.correo ?? '',
  telefono: usuario.value?.telefono ?? '',
  fechaNacimiento: usuario.value?.fechaNacimiento
    ? new Date(usuario.value.fechaNacimiento).toISOString().split('T')[0]
    : '',
})
const editandoDatos = ref(false)
const guardandoDatos = ref(false)
const errorDatos = ref('')

async function guardarDatos() {
  guardandoDatos.value = true
  errorDatos.value = ''
  try {
    const actualizado = await actualizarPerfil({
      nombre: datosPersonales.nombre,
      telefono: datosPersonales.telefono,
      fechaNacimiento: datosPersonales.fechaNacimiento || null,
    })
    usuario.value = actualizado
    editandoDatos.value = false
  } catch (error) {
    errorDatos.value = error.response?.data?.msj || 'No se pudieron guardar los cambios'
  } finally {
    guardandoDatos.value = false
  }
}

// --- Direcciones ---
// Provincias desde la API pública de CR (vía store). provincia/canton/distrito
// del formulario guardan el ID para la cascada; el nombre se resuelve al guardar.
const provincias = computed(() => ubicaciones.provincias)
const cantonesDir = ref([])
const distritosDir = ref([])
const nombreUbicacion = (lista, id) => lista.find((item) => item.id === id)?.nombre || ''

const direcciones = reactive([])

async function cargarDirecciones() {
  const { addresses } = await addressesApi.list()
  direcciones.splice(0, direcciones.length, ...addresses)
}

const mostrarFormNueva = ref(false)
const nuevaDireccion = reactive({
  etiqueta: '',
  provincia: '',
  canton: '',
  distrito: '',
  senas: '',
  codigoPostal: '',
})
const erroresDireccion = reactive({ etiqueta: '', provincia: '', canton: '', distrito: '', codigoPostal: '' })

// Cascada provincia → cantón → distrito con datos reales de la API.
watch(() => nuevaDireccion.provincia, async (provincia) => {
  nuevaDireccion.canton = ''
  nuevaDireccion.distrito = ''
  cantonesDir.value = []
  distritosDir.value = []
  if (provincia) cantonesDir.value = await ubicaciones.cantones(provincia).catch(() => [])
})
watch(() => nuevaDireccion.canton, async (canton) => {
  nuevaDireccion.distrito = ''
  distritosDir.value = []
  if (canton) distritosDir.value = await ubicaciones.distritos(nuevaDireccion.provincia, canton).catch(() => [])
})

function validarDireccion() {
  erroresDireccion.etiqueta = nuevaDireccion.etiqueta.trim() ? '' : 'Ponele un nombre (ej. Casa, Oficina).'
  erroresDireccion.provincia = nuevaDireccion.provincia ? '' : 'Seleccioná la provincia.'
  erroresDireccion.canton = nuevaDireccion.canton ? '' : 'Seleccioná el cantón.'
  erroresDireccion.distrito = nuevaDireccion.distrito ? '' : 'Seleccioná el distrito.'
  erroresDireccion.codigoPostal = /^\d{5}$/.test(nuevaDireccion.codigoPostal)
    ? ''
    : 'El código postal debe tener 5 dígitos.'
  return !Object.values(erroresDireccion).some(Boolean)
}

async function agregarDireccion() {
  if (!validarDireccion()) return
  try {
    // Se guardan los nombres legibles de la ubicación, no los IDs.
    const { address } = await addressesApi.create({
      etiqueta: nuevaDireccion.etiqueta,
      provincia: nombreUbicacion(provincias.value, nuevaDireccion.provincia),
      canton: nombreUbicacion(cantonesDir.value, nuevaDireccion.canton),
      distrito: nombreUbicacion(distritosDir.value, nuevaDireccion.distrito),
      senas: nuevaDireccion.senas,
      codigoPostal: nuevaDireccion.codigoPostal,
    })
    await cargarDirecciones()
    Object.assign(nuevaDireccion, { etiqueta: '', provincia: '', canton: '', distrito: '', senas: '', codigoPostal: '' })
    mostrarFormNueva.value = false
    return address
  } catch (error) {
    erroresDireccion.etiqueta = error.message
  }
}

async function marcarPredeterminada(id) {
  await addressesApi.update(id, { predeterminada: true })
  await cargarDirecciones()
}

async function eliminarDireccion(id) {
  await addressesApi.remove(id)
  await cargarDirecciones()
}

function cerrarSesionUsuario() {
  cerrarSesion()
  router.push({ name: 'inicio' })
}
</script>

<template>
  <div v-if="usuario" class="container py-5">
    <!-- Encabezado de cuenta -->
    <div class="card border-0 shadow-sm rounded-4 p-4 mb-4">
      <div class="d-flex flex-column flex-md-row align-items-center gap-4">
        <div
          class="d-flex align-items-center justify-content-center bg-primary text-white fw-bold rounded-4"
          style="width: 88px; height: 88px; font-size: 2rem"
        >
          {{ inicial }}
        </div>
        <div class="flex-grow-1 text-center text-md-start">
          <h1 class="h4 mb-1">{{ usuario.nombre }}</h1>
          <p class="text-secondary mb-0">{{ usuario.correo }}</p>
          <p v-if="clienteDesde" class="text-secondary small mb-0">Cliente desde {{ clienteDesde }}</p>
        </div>
        <button class="btn btn-outline-secondary" @click="cerrarSesionUsuario">
          <i class="bi bi-box-arrow-right me-1"></i> Cerrar sesión
        </button>
      </div>
    </div>

    <div class="row g-4">
      <!-- Navegación de pestañas -->
      <aside class="col-12 col-lg-3">
        <div class="list-group shadow-sm rounded-4 overflow-hidden">
          <button
            class="list-group-item list-group-item-action d-flex align-items-center gap-2"
            :class="{ active: tabActiva === 'pedidos' }"
            @click="cambiarTab('pedidos')"
          >
            <i class="bi bi-bag"></i> Pedidos
          </button>
          <button
            class="list-group-item list-group-item-action d-flex align-items-center gap-2"
            :class="{ active: tabActiva === 'personal' }"
            @click="cambiarTab('personal')"
          >
            <i class="bi bi-person"></i> Datos personales
          </button>
          <button
            class="list-group-item list-group-item-action d-flex align-items-center gap-2"
            :class="{ active: tabActiva === 'direcciones' }"
            @click="cambiarTab('direcciones')"
          >
            <i class="bi bi-geo-alt"></i> Direcciones
          </button>
        </div>
      </aside>

      <!-- Contenido de la pestaña activa -->
      <div class="col-12 col-lg-9">
        <!-- Pedidos -->
        <div v-if="tabActiva === 'pedidos'">
          <h2 class="h5 mb-3">Mis pedidos</h2>

          <div v-if="misPedidos.length === 0" class="card border-0 shadow-sm rounded-4 p-5 text-center">
            <i class="bi bi-bag-x fs-1 text-secondary mb-3"></i>
            <p class="text-secondary mb-3">Todavía no tenés pedidos realizados.</p>
            <RouterLink to="/catalogo" class="btn btn-primary align-self-center">Ir al catálogo</RouterLink>
          </div>

          <div v-else class="d-flex flex-column gap-3">
            <div
              v-for="pedido in misPedidos"
              :key="pedido.numero"
              class="card border-0 shadow-sm rounded-4 p-3"
            >
              <div class="d-flex flex-wrap justify-content-between align-items-center gap-2">
                <div>
                  <p class="fw-semibold mb-0">Pedido #{{ pedido.numero }}</p>
                  <p class="text-secondary small mb-0">{{ formatearFecha(pedido.fecha || pedido.createdAt) }}</p>
                </div>
                <span class="badge rounded-pill px-3 py-2" :class="claseEstado(pedido.estado)">
                  {{ pedido.estado }}
                </span>
                <p class="fw-semibold mb-0">{{ formatearColones(pedido.total) }}</p>
                <div class="d-flex gap-2">
                  <button class="btn btn-sm btn-outline-primary" @click="alternarDetalle(pedido.numero)">
                    {{ pedidoAbierto === pedido.numero ? 'Ocultar' : 'Ver detalle' }}
                  </button>
                  <RouterLink class="btn btn-sm btn-outline-secondary" :to="{ name: 'factura', params: { numero: pedido.numero } }">
                    <i class="bi bi-receipt me-1"></i>Factura
                  </RouterLink>
                </div>
              </div>

              <!-- Detalle del pedido: los productos comprados -->
              <ul v-if="pedidoAbierto === pedido.numero" class="list-unstyled border-top mt-3 pt-3 mb-0">
                <li
                  v-for="item in pedido.items"
                  :key="item.id"
                  class="d-flex align-items-center gap-2 mb-2"
                >
                  <img
                    :src="item.imagen"
                    :alt="item.nombre"
                    class="rounded"
                    style="width: 40px; height: 40px; object-fit: cover"
                  />
                  <span class="flex-grow-1">{{ item.cantidad }} × {{ item.nombre }}</span>
                  <span class="text-secondary">{{ formatearColones(item.precio * item.cantidad) }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Datos personales -->
        <div v-else-if="tabActiva === 'personal'">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h2 class="h5 mb-0">Datos personales</h2>
            <button v-if="!editandoDatos" class="btn btn-sm btn-outline-primary" @click="editandoDatos = true">
              <i class="bi bi-pencil me-1"></i> Editar
            </button>
          </div>
          <div class="card border-0 shadow-sm rounded-4 p-4">
            <div v-if="errorDatos" class="alert alert-danger py-2 small mb-3">
              {{ errorDatos }}
            </div>
            <form class="row g-3" @submit.prevent="guardarDatos">
              <div class="col-12 col-md-6">
                <label class="form-label">Nombre completo</label>
                <input v-model.trim="datosPersonales.nombre" type="text" class="form-control" :disabled="!editandoDatos" />
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label">Correo electrónico</label>
                <input v-model.trim="datosPersonales.correo" type="email" class="form-control" disabled />
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label">Teléfono</label>
                <input
                  v-model.trim="datosPersonales.telefono"
                  type="tel"
                  class="form-control"
                  placeholder="8888-8888"
                  :disabled="!editandoDatos"
                />
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label">Fecha de nacimiento</label>
                <input v-model="datosPersonales.fechaNacimiento" type="date" class="form-control" :disabled="!editandoDatos" />
              </div>
              <div v-if="editandoDatos" class="col-12 d-flex justify-content-end gap-2 mt-2">
                <button type="button" class="btn btn-light" @click="editandoDatos = false" :disabled="guardandoDatos">Cancelar</button>
                <button type="submit" class="btn btn-primary" :disabled="guardandoDatos">
                  {{ guardandoDatos ? 'Guardando...' : 'Guardar cambios' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Direcciones -->
        <div v-else-if="tabActiva === 'direcciones'">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h2 class="h5 mb-0">Direcciones de envío</h2>
            <button class="btn btn-sm btn-primary" @click="mostrarFormNueva = !mostrarFormNueva">
              <i class="bi bi-plus-lg me-1"></i> Agregar dirección
            </button>
          </div>

          <!-- Formulario de nueva dirección -->
          <div v-if="mostrarFormNueva" class="card border-0 shadow-sm rounded-4 p-4 mb-3">
            <form class="row g-3" novalidate @submit.prevent="agregarDireccion">
              <div class="col-12 col-md-6">
                <label class="form-label">Etiqueta</label>
                <input
                  v-model.trim="nuevaDireccion.etiqueta"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': erroresDireccion.etiqueta }"
                  placeholder="Casa, Oficina..."
                />
                <div class="invalid-feedback">{{ erroresDireccion.etiqueta }}</div>
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label">Provincia</label>
                <select
                  v-model="nuevaDireccion.provincia"
                  class="form-select"
                  :class="{ 'is-invalid': erroresDireccion.provincia }"
                >
                  <option value="">Seleccionar…</option>
                  <option v-for="p in provincias" :key="p.id" :value="p.id">{{ p.nombre }}</option>
                </select>
                <div class="invalid-feedback">{{ erroresDireccion.provincia }}</div>
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label">Cantón</label>
                <select
                  v-model="nuevaDireccion.canton"
                  class="form-select"
                  :disabled="!nuevaDireccion.provincia"
                  :class="{ 'is-invalid': erroresDireccion.canton }"
                >
                  <option value="">{{ nuevaDireccion.provincia ? 'Seleccionar…' : 'Elegí provincia' }}</option>
                  <option v-for="c in cantonesDir" :key="c.id" :value="c.id">{{ c.nombre }}</option>
                </select>
                <div class="invalid-feedback">{{ erroresDireccion.canton }}</div>
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label">Distrito</label>
                <select
                  v-model="nuevaDireccion.distrito"
                  class="form-select"
                  :disabled="!nuevaDireccion.canton"
                  :class="{ 'is-invalid': erroresDireccion.distrito }"
                >
                  <option value="">{{ nuevaDireccion.canton ? 'Seleccionar…' : 'Elegí cantón' }}</option>
                  <option v-for="d in distritosDir" :key="d.id" :value="d.id">{{ d.nombre }}</option>
                </select>
                <div class="invalid-feedback">{{ erroresDireccion.distrito }}</div>
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label">Señas exactas</label>
                <input v-model.trim="nuevaDireccion.senas" type="text" class="form-control" placeholder="Opcional" />
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label">Código postal</label>
                <input
                  v-model.trim="nuevaDireccion.codigoPostal"
                  type="text"
                  maxlength="5"
                  class="form-control"
                  :class="{ 'is-invalid': erroresDireccion.codigoPostal }"
                  placeholder="10501"
                />
                <div class="invalid-feedback">{{ erroresDireccion.codigoPostal }}</div>
              </div>
              <div class="col-12 d-flex justify-content-end gap-2">
                <button type="button" class="btn btn-light" @click="mostrarFormNueva = false">Cancelar</button>
                <button type="submit" class="btn btn-primary">Guardar dirección</button>
              </div>
            </form>
          </div>

          <div v-if="direcciones.length === 0" class="card border-0 shadow-sm rounded-4 p-5 text-center">
            <i class="bi bi-geo fs-1 text-secondary mb-3"></i>
            <p class="text-secondary mb-0">No tenés direcciones guardadas todavía.</p>
          </div>

          <div v-else class="row g-3">
            <div v-for="dir in direcciones" :key="dir._id" class="col-12 col-md-6">
              <div class="card border-0 shadow-sm rounded-4 p-3 h-100" :class="{ 'border border-primary': dir.predeterminada }">
                <span v-if="dir.predeterminada" class="badge bg-primary-subtle text-primary-emphasis mb-2 align-self-start">
                  Predeterminada
                </span>
                <p class="fw-semibold mb-1">{{ dir.etiqueta }}</p>
                <p class="text-secondary small mb-1">{{ dir.senas ? dir.senas + ', ' : '' }}{{ dir.distrito }}</p>
                <p class="text-secondary small mb-3">{{ dir.canton }}, {{ dir.provincia }} — {{ dir.codigoPostal }}</p>
                <div class="d-flex gap-2 mt-auto">
                  <button
                    v-if="!dir.predeterminada"
                    class="btn btn-sm btn-outline-primary"
                    @click="marcarPredeterminada(dir._id)"
                  >
                    Predeterminar
                  </button>
                  <button class="btn btn-sm btn-outline-danger" @click="eliminarDireccion(dir._id)">Eliminar</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
