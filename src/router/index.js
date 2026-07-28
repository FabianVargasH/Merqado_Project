import { createRouter, createWebHistory } from "vue-router";

// Rutas cargadas de forma perezosa (lazy): cada vista es su propio "chunk",
// así el navegador NO descarga el catálogo o el checkout hasta que se visitan, esto con el fin de lograr una optimización básica del rendimiento
const routes = [
  {
    path: "/",
    name: "inicio",
    component: () => import("../views/InicioView.vue"),
  },
  // Fabián
  {
    path: "/catalogo",
    name: "catalogo",
    component: () => import("../views/CatalogoView.vue"),
  },
  {
    path: "/producto/:id",
    name: "producto",
    component: () => import("../views/ProductoView.vue"),
  },
  {
    path: "/carrito",
    name: "carrito",
    component: () => import("../views/CarritoView.vue"),
  },
  // Fabián 
  /*{
    path: "/login",
    name: "login",
    component: () => import("../views/LoginView.vue"),
  },
  {
    path: "/registro",
    name: "registro",
    component: () => import("../views/RegistroView.vue"),
  },
  {
    path: "/cuenta",
    name: "cuenta",
    component: () => import("../views/CuentaView.vue"),
  },
  // Joaquín (Admin)
  // meta.admin: App.vue oculta la NavBar/Footer del cliente para darle al panel su propio layout
  {
    path: "/admin",
    name: "admin",
    component: () => import("../views/AdminDashboardView.vue"),
    meta: { admin: true },
  },
  {
    path: "/admin/inventario",
    name: "admin-inventario",
    component: () => import("../views/AdminInventarioView.vue"),
    meta: { admin: true },
  },*/
];

export default createRouter({
  history: createWebHistory(),
  routes,
  // Al cambiar de ruta, siempre volver al inicio de la página
  scrollBehavior: () => ({ top: 0 }),
});
