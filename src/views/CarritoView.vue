<script setup>
import { computed, reactive, ref } from 'vue'
import { useCarritoStore } from '../stores/carrito'
import { formatearColones } from '../utils/formato'

// El carrito es el store global: esta vista solo lo lee y lo edita.
const carrito = useCarritoStore()

// Provincias para el <select> de envío.
const provincias = ['San José', 'Alajuela', 'Cartago', 'Heredia', 'Guanacaste', 'Puntarenas', 'Limón']

// Estado del formulario de envío + pago. reactive() = un solo objeto reactivo.
//reactivo para que al cambiar cualquier propiedad del objeto, se actualice la vista automáticamente.
// No es computed porque necesitamos que sea mutable, no solo derivado de otros valores. Si fuera computed, sería solo lectura y no podríamos modificarlo.
//cuando si hemos usado computed es porque queremos derivar un valor de otros valores reactivos, pero no necesitamos modificarlo directamente.
const form = reactive({
  nombre: '',
  apellidos: '',
  provincia: '',
  canton: '',
  distrito: '',
  codigoPostal: '',
  direccion: '',
  metodoPago: 'tarjeta',
  tarjeta: '',
  expiracion: '',
  cvv: '',
  sinpe: ''
})

const intento = ref(false) // true tras el primer clic en "Finalizar": ahí mostramos errores (en caso de haber)
const confirmado = ref(false)
const numeroOrden = ref('')
const totalPagado = ref(0)

// Validación centralizada: devuelve { campo: mensaje } solo de los campos inválidos
// computed, por lo que al escribir se recalcula solo, sin listeners manuales
const errores = computed(() => {
  const e = {}
  if (!form.nombre.trim()) e.nombre = 'Ingresá tu nombre'
  if (!form.apellidos.trim()) e.apellidos = 'Ingresá tus apellidos'
  if (!form.provincia) e.provincia = 'Seleccioná una provincia'
  if (!form.canton.trim()) e.canton = 'Ingresá el cantón'
  if (!form.distrito.trim()) e.distrito = 'Ingresá el distrito'
  if (!/^\d{5}$/.test(form.codigoPostal)) e.codigoPostal = 'Debe tener 5 dígitos'
  if (!form.direccion.trim()) e.direccion = 'Ingresá la dirección exacta'

  // Los campos de pago dependen del método elegido
  if (form.metodoPago === 'tarjeta') {
    if (!/^\d{16}$/.test(form.tarjeta.replace(/\s/g, ''))) e.tarjeta = 'Número de 16 dígitos'
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(form.expiracion)) e.expiracion = 'Formato MM/AA'
    if (!/^\d{3}$/.test(form.cvv)) e.cvv = '3 dígitos'
  } else {
    if (!/^\d{8}$/.test(form.sinpe)) e.sinpe = 'Teléfono de 8 dígitos'
  }
  return e
})

const formValido = computed(() => Object.keys(errores.value).length === 0)

// Simula el pago: no hay base de datos, así que solo generamos una orden y luego la vaciamos
function finalizar() {
  intento.value = true
  if (!formValido.value) return

  numeroOrden.value = 'MQ-' + Math.floor(10000 + Math.random() * 90000)
  totalPagado.value = carrito.total // guardamos el total ANTES de vaciar
  confirmado.value = true
  carrito.vaciar()
  window.scrollTo({ top: 0 })
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
      <RouterLink to="/catalogo" class="btn btn-primary mt-2">Seguir comprando</RouterLink>
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
                      <option v-for="p in provincias" :key="p" :value="p">{{ p }}</option>
                    </select>
                    <div class="invalid-feedback">{{ errores.provincia }}</div>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Cantón</label>
                    <input
                      v-model="form.canton"
                      type="text"
                      class="form-control"
                      :class="{ 'is-invalid': intento && errores.canton }"
                    />
                    <div class="invalid-feedback">{{ errores.canton }}</div>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label">Distrito</label>
                    <input
                      v-model="form.distrito"
                      type="text"
                      class="form-control"
                      :class="{ 'is-invalid': intento && errores.distrito }"
                    />
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
                <h2 class="h5 mb-3"><i class="bi bi-credit-card me-2"></i>Método de pago</h2>

                <!-- Selección de método: cambia entre qué campos se validan en base al método seleccionado -->
                <div class="d-flex gap-3 mb-3">
                  <div class="form-check">
                    <input
                      id="pago-tarjeta"
                      v-model="form.metodoPago"
                      class="form-check-input"
                      type="radio"
                      value="tarjeta"
                    />
                    <label class="form-check-label" for="pago-tarjeta">Tarjeta</label>
                  </div>
                  <div class="form-check">
                    <input
                      id="pago-sinpe"
                      v-model="form.metodoPago"
                      class="form-check-input"
                      type="radio"
                      value="sinpe"
                    />
                    <label class="form-check-label" for="pago-sinpe">SINPE Móvil</label>
                  </div>
                </div>

                <!-- Campos de tarjeta -->
                <div v-if="form.metodoPago === 'tarjeta'" class="row g-3">
                  <div class="col-12">
                    <label class="form-label">Número de tarjeta</label>
                    <input
                      v-model="form.tarjeta"
                      type="text"
                      inputmode="numeric"
                      placeholder="0000 0000 0000 0000"
                      class="form-control"
                      :class="{ 'is-invalid': intento && errores.tarjeta }"
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

                <!-- Campo de SINPE -->
                <div v-else class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">Número SINPE Móvil</label>
                    <input
                      v-model="form.sinpe"
                      type="text"
                      inputmode="numeric"
                      maxlength="8"
                      placeholder="88887777"
                      class="form-control"
                      :class="{ 'is-invalid': intento && errores.sinpe }"
                    />
                    <div class="invalid-feedback">{{ errores.sinpe }}</div>
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

              <!-- Todos los montos salen del store, el IVA lo calcula el store -->
              <div class="d-flex justify-content-between mb-2">
                <span class="text-secondary">Subtotal</span>
                <span>{{ formatearColones(carrito.subtotal) }}</span>
              </div>
              <div class="d-flex justify-content-between mb-2">
                <span class="text-secondary">Envío</span>
                <span class="text-success">Gratis</span>
              </div>
              <div class="d-flex justify-content-between mb-2">
                <span class="text-secondary">IVA (13%)</span>
                <span>{{ formatearColones(carrito.iva) }}</span>
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
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>