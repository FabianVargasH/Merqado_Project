<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { obtenerUsuario } from '../utils/auth'

defineProps({
  title: { type: String, default: 'Panel administrativo' },
  subtitle: { type: String, default: '' }
})

const route = useRoute()


const usuario = obtenerUsuario()
const nombreAdmin = computed(() => usuario?.nombre || 'Administrador')
const inicialAdmin = computed(() => (nombreAdmin.value.trim()[0] || 'A').toUpperCase())
const links = [
  { name: 'admin', label: 'Dashboard', icon: 'bi-grid-1x2-fill' },
  { name: 'admin-inventario', label: 'Inventario', icon: 'bi-box-seam' },
  { name: 'admin-categorias', label: 'Categorías', icon: 'bi-tags' }
]
</script>

<template>
  <div class="admin-shell">
    <aside class="admin-sidebar">
      <div class="px-4 mb-4">
        <RouterLink :to="{ name: 'inicio' }" class="admin-brand text-decoration-none">Merqado</RouterLink>
        <p class="small text-secondary mb-0 mt-1">Enterprise Portal</p>
      </div>
      <nav class="nav flex-column gap-1">
        <RouterLink
          v-for="link in links"
          :key="link.name"
          :to="{ name: link.name }"
          class="admin-nav-link"
          :class="{ active: route.name === link.name }"
        >
          <i class="bi" :class="link.icon"></i>
          <span>{{ link.label }}</span>
        </RouterLink>
      </nav>
      <div class="mt-auto px-3">
        <div class="admin-user-card mb-3">
          <div class="admin-avatar">{{ inicialAdmin }}</div>
          <div>
            <strong class="small d-block">{{ nombreAdmin }}</strong>
            <span class="small text-secondary">Administrador</span>
          </div>
        </div>
        <RouterLink :to="{ name: 'inicio' }" class="btn btn-outline-primary w-100 btn-sm">Ver tienda</RouterLink>
      </div>
    </aside>
    <div class="admin-content">
      <header class="admin-topbar">
        <div>
          <h1 class="h3 mb-1 fw-bold">{{ title }}</h1>
          <p v-if="subtitle" class="text-secondary mb-0">{{ subtitle }}</p>
        </div>
        <RouterLink :to="{ name: 'admin-inventario' }" class="btn btn-primary d-none d-sm-inline-flex align-items-center gap-2">
          <i class="bi bi-plus-lg"></i> Nuevo producto
        </RouterLink>
      </header>
      <main class="admin-page">
        <slot />
      </main>
    </div>
    <nav class="admin-mobile-nav d-lg-none" aria-label="Navegación administrativa móvil">
      <RouterLink
        v-for="link in links"
        :key="`mobile-${link.name}`"
        :to="{ name: link.name }"
        class="admin-mobile-nav-link"
        :class="{ active: route.name === link.name }"
      >
        <i class="bi d-block" :class="link.icon"></i>
        <span>{{ link.label }}</span>
      </RouterLink>
      <RouterLink :to="{ name: 'inicio' }" class="admin-mobile-nav-link">
        <i class="bi bi-shop d-block"></i>
        <span>Tienda</span>
      </RouterLink>
    </nav>
  </div>
</template>
