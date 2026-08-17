const dotenv = require('dotenv')

dotenv.config()

const env = {
  port: Number(process.env.PORT || 5743),
  mongoUri: process.env.MONGODB_URI || process.env.MONGO_URI || '',
  jwtSecret: process.env.JWT_SECRET || '',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@merqado.com',
  adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
  adminName: process.env.ADMIN_NAME || 'Administrador Merqado',
}

function assertDatabaseConfig() {
  if (!env.mongoUri) {
    throw new Error('MONGODB_URI is required to start the API')
  }
}

module.exports = { env, assertDatabaseConfig }
