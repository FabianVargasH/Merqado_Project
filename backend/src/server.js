const { createApp } = require('./app')
const { connectDatabase, disconnectDatabase } = require('./config/database')
const { env, assertDatabaseConfig } = require('./config/env')

async function start() {
  assertDatabaseConfig()
  await connectDatabase(env.mongoUri)
  const server = createApp().listen(env.port, '0.0.0.0', () => {
    console.log(`Merqado API listening on port ${env.port}`)
  })

  const shutdown = async () => {
    server.close(async () => {
      await disconnectDatabase()
      process.exit(0)
    })
  }
  process.once('SIGINT', shutdown)
  process.once('SIGTERM', shutdown)
}

if (require.main === module) {
  start().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}

module.exports = { start }
