<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useCarritoStore } from '../../stores/carrito'
import { usePedidosStore } from '../../stores/pedidos'
import { useProductosStore } from '../../stores/productos'
import { useUbicacionesStore } from '../../stores/ubicaciones'
import { formatearColones } from '../../utils/formato'
import { getAccessToken } from '../../services/api'

// La factura vive en una ruta protegida, así que solo se ofrece a clientes con sesión.
const sesionActiva = computed(() => Boolean(getAccessToken()))

// El carrito es el store global: esta vista solo lo lee y lo edita.
const carrito = useCarritoStore()
//store de pedidos para guardar el historial de compras
const pedidos = usePedidosStore()
//store de productos para rebajar el stock al comprar
const productos = useProductosStore()

// Ubicaciones de Costa Rica (API pública vía backend) para el envío en cascada.
const ubicaciones = useUbicacionesStore()
const provincias = computed(() => ubicaciones.provincias)
const cantones = ref([])
const distritos = ref([])

// Estado del formulario de envío + pago. reactive() = un solo objeto reactivo.
// provincia/canton/distrito guardan el ID de la ubicación (para la cascada); el
// nombre legible se resuelve al enviar la orden.
const form = reactive({
  nombre: '',
  apellidos: '',
  provincia: '',
  canton: '',
  distrito: '',
  codigoPostal: '',
  direccion: '',
  tarjeta: '',
  expiracion: '',
  cvv: ''
})

onMounted(() => {
  ubicaciones.cargarProvincias().catch(() => {})
})

// Cascada: al cambiar provincia se cargan sus cantones y se limpia lo de abajo;
// al cambiar cantón se cargan sus distritos. Así los <select> siempre son válidos.
watch(() => form.provincia, async (provincia) => {
  form.canton = ''
  form.distrito = ''
  cantones.value = []
  distritos.value = []
  if (provincia) cantones.value = await ubicaciones.cantones(provincia).catch(() => [])
})
watch(() => form.canton, async (canton) => {
  form.distrito = ''
  distritos.value = []
  if (canton) distritos.value = await ubicaciones.distritos(form.provincia, canton).catch(() => [])
})

const intento = ref(false) // true tras el primer clic en "Finalizar": ahí mostramos errores (en caso de haber)
const confirmado = ref(false)
const numeroOrden = ref('')
const totalPagado = ref(0)
const pago = ref(null) // comprobante del pago simulado
const errorCompra = ref('')

// ID → nombre para armar el envío con nombres legibles (lo que se guarda en la orden).
const nombreUbicacion = (lista, id) => lista.find((item) => item.id === id)?.nombre || ''

// Validación centralizada: devuelve { campo: mensaje } solo de los campos inválidos
// computed, por lo que al escribir se recalcula solo, sin listeners manuales
const errores = computed(() => {
  const e = {}
  if (!form.nombre.trim()) e.nombre = 'Ingresá tu nombre'
  if (!form.apellidos.trim()) e.apellidos = 'Ingresá tus apellidos'
  if (!form.provincia) e.provincia = 'Seleccioná una provincia'
  if (!form.canton) e.canton = 'Seleccioná el cantón'
  if (!form.distrito) e.distrito = 'Seleccioná el distrito'
  if (!/^\d{5}$/.test(form.codigoPostal)) e.codigoPostal = 'Debe tener 5 dígitos'
  if (!form.direccion.trim()) e.direccion = 'Ingresá la dirección exacta'

  // Validación de la tarjeta
  if (!/^\d{16}$/.test(form.tarjeta)) e.tarjeta = 'Número de 16 dígitos'
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(form.expiracion)) {
    e.expiracion = 'Formato MM/AA'
  } else {
    // Validar que la tarjeta no esté vencida: compara MM/AA con el mes/año actuales.
    const [mes, anio] = form.expiracion.split('/').map(Number)
    const hoy = new Date()
    const anioActual = hoy.getFullYear() % 100 // año a 2 dígitos
    const mesActual = hoy.getMonth() + 1
    if (anio < anioActual || (anio === anioActual && mes <= mesActual)) {
      e.expiracion = 'Tarjeta vencida'
    }
  }
  if (!/^\d{3}$/.test(form.cvv)) e.cvv = '3 dígitos'
  return e
})

const formValido = computed(() => Object.keys(errores.value).length === 0)

// Payment remains simulated; the API validates the order, stock, and canonical totals.
async function finalizar() {
  intento.value = true
  errorCompra.value = ''
  if (!formValido.value) return

  try {
    const order = await pedidos.registrar({
      items: [...carrito.items],
      shipping: {
        nombre: form.nombre,
        apellidos: form.apellidos,
        provincia: nombreUbicacion(provincias.value, form.provincia),
        canton: nombreUbicacion(cantones.value, form.canton),
        distrito: nombreUbicacion(distritos.value, form.distrito),
        codigoPostal: form.codigoPostal,
        direccion: form.direccion,
      },
    })
    numeroOrden.value = order.numero
    totalPagado.value = order.total
    pago.value = order.payment || null
    await productos.cargar()
    confirmado.value = true
    carrito.vaciar()
    window.scrollTo({ top: 0 })
  } catch (error) {
    errorCompra.value = error.message
  }
}

// Formatea el vencimiento como MM/AA: deja solo dígitos e inserta "/" tras el mes.
function formatearVencimiento() {
  let v = form.expiracion.replace(/\D/g, '').slice(0, 4)
  if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2)
  form.expiracion = v
}
</script>

<template>
  <div class="container py-5">
    <!-- ESTADO 1: CONFIRMACIÓN (tras pago simulado) -->
    <div v-if="confirmado" class="text-center py-5">
      <i class="bi bi-check-circle-fill text-success" style="font-size: 4rem"></i>
      <h1 class="h3 fw-bold mt-3">¡Compra realizada!</h1>
      <p class="text-secondary">
        Tu orden <strong>#{{ numeroOrden }}</strong> por
        <strong>{{ formatearColones(totalPagado) }}</strong> fue procesada con éxito.
      </p>

      <!-- Comprobante del pago simulado. El monto en dólares proviene de la API
           externa de tipo de cambio consumida por el backend al liquidar la orden. -->
      <div v-if="pago" class="card border mx-auto mt-3 text-start" style="max-width: 380px">
        <div class="card-body">
          <h2 class="h6 fw-bold mb-3"><i class="bi bi-receipt me-2"></i>Comprobante de pago</h2>
          <div class="d-flex justify-content-between small mb-2">
            <span class="text-secondary">Referencia</span><span class="fw-semibold">{{ pago.referencia }}</span>
          </div>
          <div class="d-flex justify-content-between small mb-2">
            <span class="text-secondary">Estado</span>
            <span class="badge bg-success-subtle text-success">{{ pago.autorizado ? 'Autorizado' : 'Rechazado' }}</span>
          </div>
          <div class="d-flex justify-content-between small mb-2">
            <span class="text-secondary">Monto cobrado</span>
            <span class="fw-semibold">{{ formatearColones(pago.montoCRC) }}</span>
          </div>
        </div>
      </div>

      <div class="d-flex flex-wrap justify-content-center gap-2 mt-3">
        <RouterLink
          v-if="sesionActiva"
          :to="{ name: 'factura', params: { numero: numeroOrden } }"
          class="btn btn-outline-primary"
        >
          <i class="bi bi-receipt me-1"></i>Ver factura
        </RouterLink>
        <RouterLink to="/catalogo" class="btn btn-primary">Seguir comprando</RouterLink>
      </div>
    </div>

    <!-- ESTADO 2: CARRITO VACÍO -->
    <div v-else-if="!carrito.items.length" class="text-center py-5">
      <i class="bi bi-cart-x text-secondary" style="font-size: 4rem"></i>
      <h1 class="h3 fw-bold mt-3">Tu carrito está vacío</h1>
      <p class="text-secondary">Agregá productos desde el catálogo para continuar.</p>
      <RouterLink to="/catalogo" class="btn btn-primary mt-2">Ir al catálogo</RouterLink>
    </div>

    <!-- ESTADO 3: CARRITO CON PRODUCTOS + CHECKOUT -->
    <div v-else>
      <h1 class="h3 fw-bold mb-4">Finalizar compra</h1>
      <div class="row g-4 align-items-start">
        <!-- Columna izquierda: productos + envío + pago -->
        <div class="col-lg-7">
          <!-- Productos en el carrito -->
          <section class="card border mb-4">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h2 class="h5 mb-0">Tu carrito ({{ carrito.cantidadTotal }})</h2>
                <button class="btn btn-sm btn-outline-danger" @click="carrito.vaciar()">Vaciar</button>
              </div>

              <div
                v-for="item in carrito.items"
                :key="item.id"
                class="d-flex align-items-center gap-3 py-3 border-top"
              >
                <img
                  :src="item.imagen"
                  :alt="item.nombre"
                  class="rounded"
                  style="width: 64px; height: 64px; object-fit: cover"
                />
                <div class="flex-grow-1">
                  <p class="fw-semibold mb-1">{{ item.nombre }}</p>
                  <span class="text-secondary small">{{ formatearColones(item.precio) }} c/u</span>
                </div>

                <!-- Control de cantidad: usa las acciones del store -->
                <div class="btn-group" role="group" aria-label="Cantidad">
                  <button
                    class="btn btn-outline-secondary btn-sm"
                    @click="carrito.actualizarCantidad(item.id, item.cantidad - 1)"
                  >
                    <i class="bi bi-dash"></i>
                  </button>
                  <span class="btn btn-sm disabled text-dark">{{ item.cantidad }}</span>
                  <button
                    class="btn btn-outline-secondary btn-sm"
                    @click="carrito.actualizarCantidad(item.id, item.cantidad + 1)"
                  >
                    <i class="bi bi-plus"></i>
                  </button>
                </div>

                <div class="text-end" style="min-width: 90px">
                  <p class="fw-bold mb-1">{{ formatearColones(item.precio * item.cantidad) }}</p>
                  <button
                    class="btn btn-link btn-sm text-danger p-0"
                    @click="carrito.eliminar(item.id)"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </section>

          <!-- Formulario de envío + pago. novalidate: para usar nuestra propia validación. -->
          <form novalidate @submit.prevent="finalizar">
            <!-- Datos de envío -->
            <section class="card border mb-4">
              <div class="card-body">
                <h2 class="h5 mb-3"><i class="bi bi-truck me-2"></i>Datos de envío</h2>
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">Nombre</label>
                    <input
                      v-model="form.nombre"
                      type="text"
                      class="form-control"
                      :class="{ 'is-invalid': intento && errores.nombre }"
                    />
                    <div class="invalid-feedback">{{ errores.nombre }}</div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Apellidos</label>
                    <input
                      v-model="form.apellidos"
                      type="text"
                      class="form-control"
                      :class="{ 'is-invalid': intento && errores.apellidos }"
                    />
                    <div class="invalid-feedback">{{ errores.apellidos }}</div>
                  </div>
                  <div class="col-md-5">
                    <label class="form-label">Provincia</label>
                    <select
                      v-model="form.provincia"
                      class="form-select"
                      :class="{ 'is-invalid': intento && errores.provincia }"
                    >
                      <option value="">Seleccionar…</option>
                      <option v-for="p in provincias" :key="p.id" :value="p.id">{{ p.nombre }}</option>
                    </select>
                    <div class="invalid-feedback">{{ errores.provincia }}</div>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Cantón</label>
                    <select
                      v-model="form.canton"
                      class="form-select"
                      :disabled="!form.provincia"
                      :class="{ 'is-invalid': intento && errores.canton }"
                    >
                      <option value="">{{ form.provincia ? 'Seleccionar…' : 'Elegí provincia' }}</option>
                      <option v-for="c in cantones" :key="c.id" :value="c.id">{{ c.nombre }}</option>
                    </select>
                    <div class="invalid-feedback">{{ errores.canton }}</div>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label">Distrito</label>
                    <select
                      v-model="form.distrito"
                      class="form-select"
                      :disabled="!form.canton"
                      :class="{ 'is-invalid': intento && errores.distrito }"
                    >
                      <option value="">{{ form.canton ? 'Seleccionar…' : 'Elegí cantón' }}</option>
                      <option v-for="d in distritos" :key="d.id" :value="d.id">{{ d.nombre }}</option>
                    </select>
                    <div class="invalid-feedback">{{ errores.distrito }}</div>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Código postal</label>
                    <input
                      v-model="form.codigoPostal"
                      type="text"
                      maxlength="5"
                      placeholder="10101"
                      class="form-control"
                      :class="{ 'is-invalid': intento && errores.codigoPostal }"
                    />
                    <div class="invalid-feedback">{{ errores.codigoPostal }}</div>
                  </div>
                  <div class="col-md-8">
                    <label class="form-label">Dirección exacta</label>
                    <input
                      v-model="form.direccion"
                      type="text"
                      placeholder="200m sur de la iglesia, casa azul"
                      class="form-control"
                      :class="{ 'is-invalid': intento && errores.direccion }"
                    />
                    <div class="invalid-feedback">{{ errores.direccion }}</div>
                  </div>
                </div>
              </div>
            </section>

            <!-- Método de pago -->
            <section class="card border mb-4">
              <div class="card-body">
                <h2 class="h5 mb-3"><i class="bi bi-credit-card me-2"></i>Pago con tarjeta</h2>

                <!-- Campos de tarjeta -->
                <div class="row g-3">
                  <div class="col-12">
                    <label class="form-label">Número de tarjeta</label>
                    <input
                      v-model="form.tarjeta"
                      type="text"
                      inputmode="numeric"
                      maxlength="16"
                      placeholder="0000000000000000"
                      class="form-control"
                      :class="{ 'is-invalid': intento && errores.tarjeta }"
                      @input="form.tarjeta = form.tarjeta.replace(/\D/g, '')"
                    />
                    <div class="invalid-feedback">{{ errores.tarjeta }}</div>
                  </div>
                  <div class="col-6">
                    <label class="form-label">Vencimiento</label>
                    <input
                      v-model="form.expiracion"
                      type="text"
                      placeholder="MM/AA"
                      maxlength="5"
                      class="form-control"
                      :class="{ 'is-invalid': intento && errores.expiracion }"
                      @input="formatearVencimiento"
                    />
                    <div class="invalid-feedback">{{ errores.expiracion }}</div>
                  </div>
                  <div class="col-6">
                    <label class="form-label">CVV</label>
                    <input
                      v-model="form.cvv"
                      type="text"
                      inputmode="numeric"
                      maxlength="3"
                      placeholder="123"
                      class="form-control"
                      :class="{ 'is-invalid': intento && errores.cvv }"
                    />
                    <div class="invalid-feedback">{{ errores.cvv }}</div>
                  </div>
                </div>
              </div>
            </section>
          </form>
        </div>

        <!-- Columna derecha: resumen es sticky en desktop -->
        <div class="col-lg-5">
          <section class="card border shadow-sm" style="position: sticky; top: 90px">
            <div class="card-body">
              <h2 class="h5 mb-3">Resumen de la orden</h2>

              <!-- Los precios ya incluyen IVA; en el resumen de pago no se menciona.
                   El desglose del IVA se muestra en la factura. -->
              <div class="d-flex justify-content-between mb-2">
                <span class="text-secondary">Subtotal</span>
                <span>{{ formatearColones(carrito.subtotal) }}</span>
              </div>
              <div class="d-flex justify-content-between mb-2">
                <span class="text-secondary">Envío</span>
                <span class="text-success">Gratis</span>
              </div>
              <hr />
              <div class="d-flex justify-content-between fw-bold fs-5 mb-3">
                <span>Total</span>
                <span class="text-primary">{{ formatearColones(carrito.total) }}</span>
              </div>

              <!-- Triggerea la misma validación del formulario -->
              <button class="btn btn-primary w-100 py-2" @click="finalizar">
                <i class="bi bi-lock-fill me-2"></i>Finalizar compra
              </button>

              <!-- Aviso solo si intentó pagar con errores -->
              <p v-if="intento && !formValido" class="text-danger small text-center mt-2 mb-0">
                Revisá los campos marcados antes de continuar.
              </p>
              <p v-if="errorCompra" class="text-danger small text-center mt-2 mb-0">
                {{ errorCompra }}
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>
