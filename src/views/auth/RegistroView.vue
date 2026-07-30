<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { guardarUsuario } from '../../utils/auth' //Momentaneo para pruebas del front mientras se integra el backend
import PanelAuthVisual from '../../components/PanelAuthVisual.vue'

const router = useRouter()

const form = reactive({
  nombre: '',
  correo: '',
  password: '',
  confirmarPassword: '',
  terminos: false,
})

const errores = reactive({
  nombre: '',
  correo: '',
  password: '',
  confirmarPassword: '',
  terminos: '',
})

const mostrarPassword = ref(false)
const mostrarConfirmar = ref(false)
const enviando = ref(false)

const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// Al menos 8 caracteres, una mayúscula, una minúscula y un número
const regexPasswordFuerte = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/

function validarNombre() {
  errores.nombre = form.nombre.trim().length < 2 ? 'Ingresá tu nombre completo.' : ''
  return !errores.nombre
}

function validarCorreo() {
  if (!form.correo) {
    errores.correo = 'Ingresá tu correo electrónico.'
  } else if (!regexCorreo.test(form.correo)) {
    errores.correo = 'Ingresá un correo válido (ejemplo: nombre@correo.com).'
  } else {
    errores.correo = ''
  }
  return !errores.correo
}

function validarPassword() {
  if (!form.password) {
    errores.password = 'Ingresá una contraseña.'
  } else if (!regexPasswordFuerte.test(form.password)) {
    errores.password = 'Debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.'
  } else {
    errores.password = ''
  }
  // Si ya se había validado la confirmación, la revalidamos por si cambió la contraseña base
  if (form.confirmarPassword) validarConfirmarPassword()
  return !errores.password
}

function validarConfirmarPassword() {
  if (!form.confirmarPassword) {
    errores.confirmarPassword = 'Confirmá tu contraseña.'
  } else if (form.confirmarPassword !== form.password) {
    errores.confirmarPassword = 'Las contraseñas no coinciden.'
  } else {
    errores.confirmarPassword = ''
  }
  return !errores.confirmarPassword
}

function validarTerminos() {
  errores.terminos = form.terminos ? '' : 'Tenés que aceptar los términos y condiciones.'
  return !errores.terminos
}

function manejarEnvio() {
  const validaciones = [
    validarNombre(),
    validarCorreo(),
    validarPassword(),
    validarConfirmarPassword(),
    validarTerminos(),
  ]
  if (validaciones.includes(false)) return

  enviando.value = true

  // No hay backend real: creamos un usuario momentáneo con los datos del registro
  guardarUsuario({
    nombre: form.nombre.trim(),
    correo: form.correo,
    ingresoEn: new Date().toISOString(),
  })

  router.push({ name: 'cuenta' })
}
</script>

<template>
  <div class="row g-0 min-vh-100">
    <PanelAuthVisual>
      <template #headline>Sumate a la<br />comunidad Merqado.</template>
    </PanelAuthVisual>

    <!-- Panel de formulario -->
    <div class="col-12 col-lg-6 d-flex align-items-center justify-content-center py-5 px-3 px-sm-4 position-relative">
      <div class="w-100" style="max-width: 400px">
        <div class="text-center mb-4">
          <span
            class="d-inline-flex align-items-center justify-content-center bg-primary text-white fw-bold rounded-3 mb-3"
            style="width: 56px; height: 56px; font-size: 1.25rem"
          >
            mq
          </span>
          <h1 class="h3 mb-1">Creá tu cuenta</h1>
          <p class="text-secondary">Completá tus datos para empezar a comprar</p>
        </div>

        <!-- Tabs de navegación entre Login y Registro -->
        <div class="d-flex p-1 bg-light rounded-3 mb-4">
          <RouterLink to="/login" class="tab-auth flex-fill text-center py-2 rounded-3 fw-semibold text-decoration-none">
            Iniciar sesión
          </RouterLink>
          <RouterLink to="/registro" class="tab-auth flex-fill text-center py-2 rounded-3 fw-semibold text-decoration-none tab-auth--activo">
            Registrarse
          </RouterLink>
        </div>

        <form novalidate @submit.prevent="manejarEnvio">
          <div class="mb-3">
            <label class="form-label" for="nombre">Nombre completo</label>
            <div class="input-group has-validation">
              <span class="input-group-text bg-white"><i class="bi bi-person"></i></span>
              <input
                id="nombre"
                v-model.trim="form.nombre"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errores.nombre }"
                placeholder="abcd.."
                autocomplete="name"
                @blur="validarNombre"
              />
              <div class="invalid-feedback">{{ errores.nombre }}</div>
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label" for="correo">Correo electrónico</label>
            <div class="input-group has-validation">
              <span class="input-group-text bg-white"><i class="bi bi-envelope"></i></span>
              <input
                id="correo"
                v-model.trim="form.correo"
                type="email"
                class="form-control"
                :class="{ 'is-invalid': errores.correo }"
                placeholder="abcd@example.com"
                autocomplete="email"
                @blur="validarCorreo"
              />
              <div class="invalid-feedback">{{ errores.correo }}</div>
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label" for="password">Contraseña</label>
            <div class="input-group has-validation">
              <span class="input-group-text bg-white"><i class="bi bi-lock"></i></span>
              <input
                id="password"
                v-model="form.password"
                :type="mostrarPassword ? 'text' : 'password'"
                class="form-control"
                :class="{ 'is-invalid': errores.password }"
                placeholder="Mínimo 8 caracteres"
                autocomplete="new-password"
                @blur="validarPassword"
              />
              <button
                type="button"
                class="input-group-text bg-white"
                :aria-label="mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                @click="mostrarPassword = !mostrarPassword"
              >
                <i class="bi" :class="mostrarPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
              </button>
              <div class="invalid-feedback">{{ errores.password }}</div>
            </div>
            <div class="form-text">Debe incluir mayúscula, minúscula y número.</div>
          </div>

          <div class="mb-3">
            <label class="form-label" for="confirmarPassword">Confirmar contraseña</label>
            <div class="input-group has-validation">
              <span class="input-group-text bg-white"><i class="bi bi-lock"></i></span>
              <input
                id="confirmarPassword"
                v-model="form.confirmarPassword"
                :type="mostrarConfirmar ? 'text' : 'password'"
                class="form-control"
                :class="{ 'is-invalid': errores.confirmarPassword }"
                placeholder="Repetí tu contraseña"
                autocomplete="new-password"
                @blur="validarConfirmarPassword"
              />
              <button
                type="button"
                class="input-group-text bg-white"
                :aria-label="mostrarConfirmar ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                @click="mostrarConfirmar = !mostrarConfirmar"
              >
                <i class="bi" :class="mostrarConfirmar ? 'bi-eye-slash' : 'bi-eye'"></i>
              </button>
              <div class="invalid-feedback">{{ errores.confirmarPassword }}</div>
            </div>
          </div>

          <div class="mb-4">
            <div class="form-check">
              <input
                id="terminos"
                v-model="form.terminos"
                type="checkbox"
                class="form-check-input"
                :class="{ 'is-invalid': errores.terminos }"
                @change="validarTerminos"
              />
              <label class="form-check-label small" for="terminos">
                Acepto los <a href="#" class="text-primary text-decoration-none">Términos de servicio</a> y la
                <a href="#" class="text-primary text-decoration-none">Política de privacidad</a>.
              </label>
              <div class="invalid-feedback">{{ errores.terminos }}</div>
            </div>
          </div>

          <button type="submit" class="btn btn-primary w-100 py-2 fw-semibold" :disabled="enviando">
            Crear cuenta
          </button>
        </form>

        <p class="text-center text-secondary mt-4 mb-0">
          ¿Ya tenés cuenta?
          <RouterLink to="/login" class="text-primary fw-semibold text-decoration-none">Iniciá sesión</RouterLink>
        </p>
      </div>

      <i class="bi bi-bag decorativo-bolsa d-none d-lg-block"></i>
    </div>
  </div>
</template>

<style scoped>
.tab-auth {
  color: var(--bs-secondary-color);
}
.tab-auth--activo,
.tab-auth.router-link-exact-active {
  background: #fff;
  color: var(--bs-primary);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.decorativo-bolsa {
  position: absolute;
  bottom: 24px;
  right: 24px;
  font-size: 5rem;
  color: var(--bs-primary);
  opacity: 0.12;
  pointer-events: none;
}
</style>