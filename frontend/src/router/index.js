import { createRouter, createWebHistory } from "vue-router";
import { getAccessToken } from "../services/api";

// Rutas cargadas de forma perezosa (lazy): cada vista es su propio "chunk",
// así el navegador NO descarga el catálogo o el checkout hasta que se visitan, esto con el fin de lograr una optimización básica del rendimiento
const routes = [
  {
    path: "/",
    name: "inicio",
    component: () => import("../views/client/InicioView.vue"),
  },

  {
    path: "/catalogo",
    name: "catalogo",
    component: () => import("../views/client/CatalogoView.vue"),
  },
  {
    path: "/producto/:id",
    name: "producto",
    component: () => import("../views/client/ProductoView.vue"),
  },
  {
    path: "/carrito",
    name: "carrito",
    component: () => import("../views/client/CarritoView.vue"),
  },

  {
    path: "/login",
    name: "login",
    component: () => import("../views/auth/LoginView.vue"),
    meta: { auth: true },
  },
  {
    path: "/registro",
    name: "registro",
    component: () => import("../views/auth/RegistroView.vue"),
    meta: { auth: true },
  },
  {
    path: "/cuenta",
    name: "cuenta",
    component: () => import("../views/client/CuentaView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/factura/:numero",
    name: "factura",
    component: () => import("../views/client/FacturaView.vue"),
    meta: { requiresAuth: true },
  },
  
  {
    path: "/admin",
    name: "admin",
    component: () => import("../views/admin/AdminDashboardView.vue"),
    meta: { admin: true, requiresAdmin: true },
  },
  {
    path: "/admin/inventario",
    name: "admin-inventario",
    component: () => import("../views/admin/AdminInventarioView.vue"),
    meta: { admin: true, requiresAdmin: true },
  },
  {
    path: "/admin/categorias",
    name: "admin-categorias",
    component: () => import("../views/admin/AdminCategoriasView.vue"),
    meta: { admin: true, requiresAdmin: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  // Al cambiar de ruta, siempre volver al inicio de la página
  scrollBehavior: () => ({ top: 0 }),
});

router.beforeEach((to) => {
  const token = getAccessToken()

  if (to.meta.requiresAdmin && !token) {
    return { name: token ? 'inicio' : 'login' }
  }
  if (to.meta.requiresAuth && !token) return { name: 'login' }
  return true
})

export default router
