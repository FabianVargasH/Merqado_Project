<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppFooter from './components/AppFooter.vue'
import NavBar from './components/NavBar.vue'

// El panel admin (meta.admin) usa su propio layout, así que ocultamos
// la NavBar y el Footer del cliente en esas rutas.
const route = useRoute()
const esAdmin = computed(() => route.meta.admin === true)
</script>

<template>
  <NavBar v-if="!esAdmin" />
  <main class="min-vh-100">
    <RouterView />
  </main>
  <AppFooter v-if="!esAdmin" />
</template>
