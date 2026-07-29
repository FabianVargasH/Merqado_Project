<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { guardarUsuario } from '../../utils/auth'
import PanelAuthVisual from '../../components/PanelAuthVisual.vue'

const router = useRouter()

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

function manejarEnvio() {
  const correoValido = validarCorreo()
  const passwordValido = validarPassword()
  if (!correoValido || !passwordValido) return

  enviando.value = true

  guardarUsuario({
    nombre: form.correo.split('@')[0],
    correo: form.correo,
    ingresoEn: new Date().toISOString(),
  })

  router.push({ name: 'cuenta' })
}
</script>

<template>
  <div class="row g-0 min-vh-100">
    <PanelAuthVisual>
      <template #headline>Compra fácil,<br />vive mejor.</template>
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
          <h1 class="h3 mb-1">Bienvenido de nuevo</h1>
          <p class="text-secondary">Ingresá tus datos para acceder a tu cuenta</p>
        </div>

        <!-- Tabs de navegación entre Login y Registro -->
        <div class="d-flex p-1 bg-light rounded-3 mb-4">
          <RouterLink to="/login" class="tab-auth flex-fill text-center py-2 rounded-3 fw-semibold text-decoration-none tab-auth--activo">
            Iniciar sesión
          </RouterLink>
          <RouterLink to="/registro" class="tab-auth flex-fill text-center py-2 rounded-3 fw-semibold text-decoration-none">
            Registrarse
          </RouterLink>
        </div>

        <!-- Botones sociales: solo decorativos, no hay backend real todavía -->
        <div class="row g-2 mb-3">
          <div class="col-6">
            <!-- Agregado meramente por apegarse al wireframe inicial, posiblemente se quite con el backend -->
            <button type="button" class="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2" disabled title="Próximamente disponible">
              <i class="bi bi-google"></i> Google 
            </button>
          </div>
          <div class="col-6">
             <!-- Agregado meramente por apegarse al wireframe inicial, posiblemente se quite con el backend -->
            <button type="button" class="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2" disabled title="Próximamente disponible">
              <i class="bi bi-apple"></i> Apple
            </button>
          </div>
        </div>

        <div class="d-flex align-items-center gap-3 mb-3">
          <hr class="flex-grow-1" />
          <span class="small text-secondary text-nowrap">o continuá con correo electrónico</span>
          <hr class="flex-grow-1" />
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

          <button type="submit" class="btn btn-primary w-100 py-2 fw-semibold mt-4" :disabled="enviando">
            Iniciar sesión
          </button>
        </form>

        <p class="text-center text-secondary mt-4 mb-0">
          ¿No tenés cuenta?
          <RouterLink to="/registro" class="text-primary fw-semibold text-decoration-none">Registrate gratis</RouterLink>
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