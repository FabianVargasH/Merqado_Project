# Merqado

Tienda en línea desarrollada como proyecto final del curso **SOFT-12: Programación Web Avanzada**, Universidad CENFOTEC.

## Descripción

Merqado es una aplicación e-commerce full-stack que permite a los usuarios explorar un catálogo de productos, gestionar un carrito de compras, registrar pedidos y administrar su cuenta. Incluye un panel administrativo para la gestión de inventario y pedidos.

## Tecnologías

**Frontend**
- Vue 3 (Composition API)
- Vite
- Pinia (manejo de estado)
- Vue Router
- Bootstrap 5 + Bootstrap Icons
- Axios

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT (autenticación)
- bcryptjs (hash de contraseñas)

## Funcionalidades principales

- Registro e inicio de sesión de usuarios (cliente / administrador)
- Catálogo de productos con búsqueda, filtros y ordenamiento
- Carrito de compras persistente
- Checkout con validación server-side de precios, IVA y stock
- Gestión de pedidos con estados (Procesando, En camino, Entregado, Cancelado)
- Historial de pedidos por usuario
- CRUD de direcciones de envío
- CRUD de productos e inventario (panel de administrador)
- Rutas protegidas según rol de usuario

## Estructura del proyecto

```
proyecto/
├── backend/     API REST (Node.js + Express + MongoDB)
└── frontend/    Interfaz (Vue 3 + Vite)
```

## Instalación

### Requisitos previos

- Node.js v16+ y npm v8+
- Cuenta de MongoDB Atlas (o instancia local de MongoDB)

### Backend

```bash
cd backend
npm install
```

Crear un archivo `.env` en `backend/` basado en `.env.example`:

```env
PORT=3000
MONGO_URI=<tu_connection_string_de_mongodb>
JWT_SECRET=<tu_clave_secreta>
CLIENT_ORIGIN=http://localhost:5173
```

Iniciar el servidor:

```bash
npm run dev
```

El backend estará disponible en `http://localhost:3000/api`.

### Frontend

```bash
cd frontend
npm install
```

Crear un archivo `.env` en `frontend/`:

```env
VITE_API_URL=http://localhost:3000/api
```

Iniciar la aplicación:

```bash
npm run dev
```

El frontend estará disponible en `http://localhost:5173`.

### Poblar la base de datos (opcional)

Para cargar productos de ejemplo:

```bash
cd backend
node scripts/seed.js
```

## Solución de problemas

| Problema | Solución |
|---|---|
| Error de conexión a MongoDB | Verificar `MONGO_URI` y credenciales en `.env` |
| Puerto en uso | Cambiar `PORT` en `.env` del backend o el puerto de Vite |
| Módulos no encontrados | Eliminar `node_modules/` y correr `npm install` de nuevo |
| Errores de CORS | Verificar `CLIENT_ORIGIN` en el `.env` del backend |

## Licencia

Proyecto académico desarrollado con fines educativos para Universidad CENFOTEC.
