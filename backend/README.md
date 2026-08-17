# Merqado API

## Local setup

```bash
npm ci
cp .env.example .env
npm run seed
npm run dev
```

The API listens on port `5743` by default. `MONGODB_URI` must point to a MongoDB replica set when creating orders because stock decrement and order creation run in one transaction (a MongoDB Atlas cluster already works).

`npm run seed` populates products and categories from `src/data/*.json` (backend-owned seed data) and creates an admin user so the admin panel can be demonstrated. Override the admin credentials with `ADMIN_EMAIL` / `ADMIN_PASSWORD` (defaults: `admin@merqado.com` / `admin123`).

## Endpoints

| Método | Ruta | Descripción | Auth |
| --- | --- | --- | --- |
| POST | `/api/usuarios/registro` | Registrar usuario | — |
| POST | `/api/usuarios/login` | Iniciar sesión (devuelve JWT) | — |
| GET/PATCH | `/api/usuarios/perfil` | Consultar / actualizar perfil | Token |
| GET | `/api/products` | Listar / filtrar productos | — |
| GET | `/api/products/:id` | Consultar producto | — |
| POST/PATCH/DELETE | `/api/products/:id` | CRUD de productos | Admin |
| GET | `/api/categories` | Listar categorías (con conteo de productos) | — |
| GET | `/api/categories/:id` | Consultar categoría | — |
| POST/PATCH/DELETE | `/api/categories/:id` | CRUD de categorías | Admin |
| POST | `/api/orders` | Crear orden (procesa el pago) | Opcional |
| GET | `/api/orders/me` | Compras del usuario | Token |
| GET | `/api/orders/admin/all` | Todas las órdenes | Admin |
| PATCH | `/api/orders/admin/:id/status` | Cambiar estado de una orden | Admin |
| GET/PUT/DELETE | `/api/cart` | Carrito del usuario (leer / reemplazar / vaciar) | Token |
| GET | `/api/orders/by-number/:numero` | Orden por número (factura del cliente) | Token |
| GET | `/api/locations/...` | Provincias/cantones/distritos de Costa Rica (API externa) | — |
| GET/POST/PATCH/DELETE | `/api/users/me/addresses` | CRUD de direcciones | Token |

## Consumo de API de terceros (ubicaciones de Costa Rica)

El formulario de envío se llena con datos reales de la API pública de ubicaciones de
Costa Rica ([ubicaciones.paginasweb.cr](https://ubicaciones.paginasweb.cr), sin API key).
`src/services/crLocations.js` consume el tercero (con timeout y manejo de errores) y
`src/routes/locations.js` lo expone en cascada como provincia → cantón → distrito; si el
tercero falla responde `502`. Se consume desde el backend (no el navegador) para evitar
CORS y mantener el consumo del tercero en una capa de servicio.

El pago (`src/services/paymentGateway.js`) es simulado en colones: autoriza localmente y
genera una referencia de transacción, sin depender de un procesador externo.

## Authentication

Both local JWTs (emitidos por `/api/usuarios/login`) y tokens de socios con
`{ id, email, role }` firmados con el mismo `JWT_SECRET` son aceptados. Las rutas de
admin requieren `role: "admin"` (o `tipoUsuario: "admin"` en el usuario local). El
frontend busca el token en `merqado_usuario`, `merqado_access_token` o `token` en
`localStorage`.

## Tests

```bash
npm test
```
