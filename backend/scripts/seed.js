const fs = require('node:fs/promises')
const path = require('node:path')
const { connectDatabase, disconnectDatabase } = require('../src/config/database')
const { env, assertDatabaseConfig } = require('../src/config/env')
const Product = require('../src/models/Product')

async function seed() {
  assertDatabaseConfig()
  await connectDatabase(env.mongoUri)
  const file = path.resolve(__dirname, '../../frontend/src/data/productos.json')
  const products = JSON.parse(await fs.readFile(file, 'utf8'))
  await Product.bulkWrite(products.map((product) => ({
    updateOne: { filter: { id: product.id }, update: { $set: product }, upsert: true },
  })))
  console.log(`Seeded ${products.length} products`)
  await disconnectDatabase()
}

seed().catch(async (error) => {
  console.error(error)
  try { await disconnectDatabase() } catch {}
  process.exit(1)
})
