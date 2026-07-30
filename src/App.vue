<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import AppFooter from './components/AppFooter.vue'
import NavBar from './components/NavBar.vue'
import { usePedidosStore } from './stores/pedidos'
import { useProductosStore } from './stores/productos'

const route = useRoute()

// El panel admin (meta.admin) usa su propio layout, así que ocultamos
// la NavBar y el Footer del cliente en esas rutas.
const esAdmin = computed(() => route.meta.admin === true)

// Las pantallas de auth (login/registro) tampoco llevan NavBar/Footer del cliente.
const esAuth = computed(() => route.meta.auth === true)

// Sincronización entre pestañas: si el admin cambia un pedido (o el stock) en una
// pestaña, la del cliente lo refleja al instante. El evento 'storage' solo se
// dispara en las OTRAS pestañas, que es justo lo que queremos.
const pedidos = usePedidosStore()
const productos = useProductosStore()
function alCambiarStorage(e) {
  if (e.key === 'pedidos') pedidos.sincronizar()
  if (e.key === 'productos') productos.sincronizar()
}
onMounted(() => window.addEventListener('storage', alCambiarStorage))
onUnmounted(() => window.removeEventListener('storage', alCambiarStorage))
</script>

<template>
  <NavBar v-if="!esAdmin && !esAuth" />
  <main class="min-vh-100">
    <RouterView />
  </main>
  <AppFooter v-if="!esAdmin && !esAuth" />
</template>