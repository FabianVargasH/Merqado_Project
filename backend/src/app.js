const express = require('express')
const cors = require('cors')
const { env } = require('./config/env')
const productsRouter = require('./routes/products')
const ordersRouter = require('./routes/orders')
const addressesRouter = require('./routes/addresses')
const usuariosRouter = require('./routes/usuarios.route')
const { healthHandler } = require('./routes/health')
const { notFound, errorHandler } = require('./middleware/errors')

function createApp() {
  const app = express()
  app.use(cors({ origin: env.clientOrigin }))
  app.use(express.json({ limit: '1mb' }))

  app.get('/api/health', healthHandler)
  app.use('/api/usuarios', usuariosRouter)
  app.use('/api/products', productsRouter)
  app.use('/api/orders', ordersRouter)
  app.use('/api/users/me/addresses', addressesRouter)
  app.use(notFound)
  app.use(errorHandler)
  return app
}

module.exports = { createApp }
