<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppFooter from './components/AppFooter.vue'
import NavBar from './components/NavBar.vue'

const route = useRoute()

// El panel admin (meta.admin) usa su propio layout, así que ocultamos
// la NavBar y el Footer del cliente en esas rutas.
const esAdmin = computed(() => route.meta.admin === true)

// Las pantallas de auth (login/registro) tampoco llevan NavBar/Footer del cliente.
const esAuth = computed(() => route.meta.auth === true)
</script>

<template>
  <NavBar v-if="!esAdmin && !esAuth" />
  <main class="min-vh-100">
    <RouterView />
  </main>
  <AppFooter v-if="!esAdmin && !esAuth" />
</template>