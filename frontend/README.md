# Merqado

Proyecto del curso **Programación Avanzada** — Universidad Cenfotec.

Tienda en línea construida con Vue 3 y una API Express/MongoDB. El carrito permanece local mientras productos, inventario y pedidos se gestionan mediante el backend.

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

- Productos, inventario y pedidos se cargan desde la API configurada en `VITE_API_URL`
- IVA de Costa Rica (13%) incluido en todos los cálculos
- Envío gratis en todos los pedidos
- Login y registro son responsabilidad de la integración del partner
