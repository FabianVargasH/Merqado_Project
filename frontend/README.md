# Merqado

Proyecto del curso **Programación Avanzada** — Universidad Cenfotec.

Tienda en línea simulada construida completamente en el front-end con Vue 3. Catálogo de productos, carrito de compras y checkout con validación, todo persistido en `localStorage`.

## Tech Stack

- **Vue 3** (Composition API, `<script setup>`)
- **Pinia** — estado global
- **Vue Router 4** — lazy-loading, `createWebHistory`
- **Bootstrap 5.3** + **Bootstrap Icons**
- **Vite 5**

## Funcionalidades

| Ruta | Página |
|---|---|
| `/` | Inicio — hero, categorías, productos destacados |
| `/catalogo` | Catálogo — grilla con filtros, búsqueda, orden y paginación |
| `/producto/:id` | Detalle de producto — info, rating, selector de cantidad, relacionados |
| `/carrito` | Checkout — resumen, formulario de envío, pago simulado |
| `/login` | Login |
| `/registro` | Registro |
| `/cuenta` | Mis pedidos |
| `/admin` | Dashboard admin |
| `/admin/inventario` | Inventario admin |

## Instalación

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Estructura

```
src/
├── assets/          # Estilos e imágenes
├── components/      # NavBar, Footer, ProductCard
├── data/            # JSON mock de productos y categorías
├── router/          # Configuración de rutas
├── stores/          # Pinia: carrito y pedidos
├── utils/           # Formateo de moneda (¢)
└── views/           # Páginas
```

## Notas

- Sin backend — datos mock en JSON, persistencia en `localStorage`
- IVA de Costa Rica (13%) incluido en todos los cálculos
- Envío gratis en todos los pedidos
- Las vistas de login, registro, cuenta y admin son placeholders
