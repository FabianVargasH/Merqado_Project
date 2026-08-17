<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { iniciarSesion, cerrarSesion } from '../../utils/auth'
import PanelAuthVisual from '../../components/PanelAuthVisual.vue'

const router = useRouter()

// Tipo de acceso elegido en la pantalla: 'cliente' (tienda) o 'admin' (panel de
// personal). why: el backend autentica igual y el rol real vive en la base; este
// modo solo diferencia la experiencia y valida que la cuenta tenga el rol esperado.
const modo = ref('cliente')
const esModoAdmin = computed(() => modo.value === 'admin')
function cambiarModo(nuevo) {
  modo.value = nuevo
  errorGeneral.value = ''
}

const form = reactive({
  correo: '',
  password: '',
})

const errores = reactive({
  correo: '',
  password: '',
})

const mostrarPassword = ref(false)
const enviando = ref(false)
const errorGeneral = ref('')

const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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
    errores.password = 'Ingresá tu contraseña.'
  } else if (form.password.length < 8) {
    errores.password = 'La contraseña debe tener al menos 8 caracteres.'
  } else {
    errores.password = ''
  }
  return !errores.password
}

async function manejarEnvio() {
  const correoValido = validarCorreo()
  const passwordValido = validarPassword()
  if (!correoValido || !passwordValido) return

  enviando.value = true
  errorGeneral.value = ''

  try {
    const usuario = await iniciarSesion({ correo: form.correo, password: form.password })
    const esAdmin = usuario.tipoUsuario === 'admin'
    if (esModoAdmin.value) {
      // En modo administrador la cuenta debe tener el rol; si no, se revierte la
      // sesión y se avisa, para que el acceso diferenciado tenga efecto real.
      if (!esAdmin) {
        cerrarSesion()
        errorGeneral.value = 'Esta cuenta no tiene acceso administrativo.'
        return
      }
      router.push({ name: 'admin' })
    } else {
      // En modo cliente siempre va a su cuenta (un admin también puede comprar).
      router.push({ name: 'cuenta' })
    }
  } catch (error) {
    errorGeneral.value = error.response?.data?.msj || 'No se pudo iniciar sesión'
  } finally {
    enviando.value = false
  }
}
</script>

<template>
  <div class="row g-0 min-vh-100">
    <PanelAuthVisual>
      <template #headline>Compra fácil,<br />vive mejor.</template>
    </PanelAuthVisual>

    <div class="col-12 col-lg-6 d-flex align-items-center justify-content-center py-5 px-3 px-sm-4 position-relative">
      <div class="w-100" style="max-width: 400px">
        <div class="text-center mb-4">
          <span
            class="d-inline-flex align-items-center justify-content-center text-white fw-bold rounded-3 mb-3"
            :class="esModoAdmin ? 'bg-dark' : 'bg-primary'"
            style="width: 56px; height: 56px; font-size: 1.25rem"
          >
            <i v-if="esModoAdmin" class="bi bi-shield-lock"></i>
            <template v-else>mq</template>
          </span>
          <h1 class="h3 mb-1">{{ esModoAdmin ? 'Acceso administrativo' : 'Bienvenido de nuevo' }}</h1>
          <p class="text-secondary">
            {{ esModoAdmin ? 'Ingresá con tu cuenta de personal para gestionar la tienda' : 'Ingresá tus datos para acceder a tu cuenta' }}
          </p>
        </div>

        <!-- El personal no se auto-registra: en modo administrativo no se ofrece
             la opción de "Registrarse". -->
        <div v-if="!esModoAdmin" class="d-flex p-1 bg-light rounded-3 mb-4">
          <RouterLink to="/login" class="tab-auth flex-fill text-center py-2 rounded-3 fw-semibold text-decoration-none tab-auth--activo">
            Iniciar sesión
          </RouterLink>
          <RouterLink to="/registro" class="tab-auth flex-fill text-center py-2 rounded-3 fw-semibold text-decoration-none">
            Registrarse
          </RouterLink>
        </div>

        <div v-if="errorGeneral" class="alert alert-danger py-2 small mb-3">
          {{ errorGeneral }}
        </div>

        <form novalidate @submit.prevent="manejarEnvio">
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

          <div class="mb-2">
            <div class="d-flex justify-content-between align-items-center">
              <label class="form-label" for="password">Contraseña</label>
              <a href="#" class="small text-primary text-decoration-none">¿Has olvidado tu contraseña?</a>
            </div>
            <div class="input-group has-validation">
              <span class="input-group-text bg-white"><i class="bi bi-lock"></i></span>
              <input
                id="password"
                v-model="form.password"
                :type="mostrarPassword ? 'text' : 'password'"
                class="form-control"
                :class="{ 'is-invalid': errores.password }"
                placeholder="Mínimo 8 caracteres"
                autocomplete="current-password"
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
          </div>

          <button
            type="submit"
            class="btn w-100 py-2 fw-semibold mt-4"
            :class="esModoAdmin ? 'btn-dark' : 'btn-primary'"
            :disabled="enviando"
          >
            <i v-if="esModoAdmin" class="bi bi-shield-lock me-1"></i>
            {{ esModoAdmin ? 'Ingresar al panel' : 'Iniciar sesión' }}
          </button>
        </form>

        <div class="text-center mt-4">
          <p v-if="!esModoAdmin" class="text-secondary mb-2">
            ¿No tenés cuenta?
            <RouterLink to="/registro" class="text-primary fw-semibold text-decoration-none">Registrate gratis</RouterLink>
          </p>
          <!-- Acceso diferenciado para personal de Merqado: botón discreto que activa
               el modo administrador (el rol real se valida contra la base al ingresar). -->
          <button type="button" class="btn-acceso-personal" @click="cambiarModo(esModoAdmin ? 'cliente' : 'admin')">
            <i class="bi" :class="esModoAdmin ? 'bi-arrow-left' : 'bi-shield-lock'"></i>
            {{ esModoAdmin ? 'Volver a acceso de cliente' : 'Personal de Merqado' }}
          </button>
        </div>
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

/* Acceso para personal: botón pequeño, con el fondo de la página y borde azul
   para diferenciarse sin competir con el botón principal de inicio de sesión. */
.btn-acceso-personal {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: transparent;
  border: 1px solid var(--bs-primary);
  color: var(--bs-primary);
  border-radius: 0.6rem;
  padding: 0.35rem 0.9rem;
  font-size: 0.82rem;
  font-weight: 600;
  transition: all 0.15s ease;
}
.btn-acceso-personal:hover {
  background: var(--bs-primary);
  color: #fff;
}
</style>