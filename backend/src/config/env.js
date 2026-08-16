const dotenv = require('dotenv')

dotenv.config()

const env = {
  port: Number(process.env.PORT || 5743),
  mongoUri: process.env.MONGODB_URI || process.env.MONGO_URI || '',
  jwtSecret: process.env.JWT_SECRET || '',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
}

function assertDatabaseConfig() {
  if (!env.mongoUri) {
    throw new Error('MONGODB_URI is required to start the API')
  }
}

module.exports = { env, assertDatabaseConfig }
