const express = require('express')
const cors = require('cors')
const { env } = require('./config/env')
const productsRouter = require('./routes/products')
const categoriesRouter = require('./routes/categories')
const ordersRouter = require('./routes/orders')
const cartRouter = require('./routes/cart')
const locationsRouter = require('./routes/locations')
const addressesRouter = require('./routes/addresses')
const usuariosRouter = require('./routes/usuarios.route')
const { healthHandler } = require('./routes/health')
const { notFound, errorHandler } = require('./middleware/errors')

// Orígenes permitidos por CORS. why función y no un string fijo: en desarrollo el
// frontend puede correr en cualquier puerto de localhost (5173, 5174, …), así que
// aceptamos cualquier localhost además del CLIENT_ORIGIN configurado (para prod).
const allowedOrigins = env.clientOrigin.split(',').map((origin) => origin.trim()).filter(Boolean)
function corsOrigin(origin, callback) {
  const esLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin || '')
  if (!origin || esLocalhost || allowedOrigins.includes(origin)) return callback(null, true)
  return callback(new Error('Origen no permitido por CORS'))
}

function createApp() {
  const app = express()
  app.use(cors({ origin: corsOrigin }))
  app.use(express.json({ limit: '1mb' }))

  app.get('/api/health', healthHandler)
  app.use('/api/usuarios', usuariosRouter)
  app.use('/api/products', productsRouter)
  app.use('/api/categories', categoriesRouter)
  app.use('/api/orders', ordersRouter)
  app.use('/api/cart', cartRouter)
  app.use('/api/locations', locationsRouter)
  app.use('/api/users/me/addresses', addressesRouter)
  app.use(notFound)
  app.use(errorHandler)
  return app
}

module.exports = { createApp }
