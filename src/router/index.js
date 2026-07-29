import { createRouter, createWebHistory } from "vue-router";

// Rutas cargadas de forma perezosa (lazy): cada vista es su propio "chunk",
// así el navegador NO descarga el catálogo o el checkout hasta que se visitan, esto con el fin de lograr una optimización básica del rendimiento
const routes = [
  {
    path: "/",
    name: "inicio",
    component: () => import("../views/client/InicioView.vue"),
  },
  // Fabián
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
  // Fabián
  {
    path: "/login",
    name: "login",
    component: () => import("../views/auth/LoginView.vue"),
  },
  {
    path: "/registro",
    name: "registro",
    component: () => import("../views/auth/RegistroView.vue"),
  },
  {
    path: "/cuenta",
    name: "cuenta",
    component: () => import("../views/client/CuentaView.vue"),
  },
  // Joaquín (Admin)
  // meta.admin: App.vue oculta la NavBar/Footer del cliente para darle al panel su propio layout
  {
    path: "/admin",
    name: "admin",
    component: () => import("../views/admin/AdminDashboardView.vue"),
    meta: { admin: true },
  },
  {
    path: "/admin/inventario",
    name: "admin-inventario",
    component: () => import("../views/admin/AdminInventarioView.vue"),
    meta: { admin: true },
  },
];

export default createRouter({
  history: createWebHistory(),
  routes,
  // Al cambiar de ruta, siempre volver al inicio de la página
  scrollBehavior: () => ({ top: 0 }),
});
