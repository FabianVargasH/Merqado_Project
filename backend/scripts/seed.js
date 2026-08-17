const fs = require('node:fs/promises')
const path = require('node:path')
const bcrypt = require('bcryptjs')
const { connectDatabase, disconnectDatabase } = require('../src/config/database')
const { env, assertDatabaseConfig } = require('../src/config/env')
const Product = require('../src/models/Product')
const Category = require('../src/models/Category')
const Usuario = require('../src/models/usuarios.model')

// Lee un JSON semilla propio del backend (src/data). why: los datos del catálogo
// ahora son del backend, no del frontend, para que el seed sea autocontenido y no
// dependa de la carpeta del cliente.
async function readSeedData(name) {
  const file = path.resolve(__dirname, `../src/data/${name}`)
  return JSON.parse(await fs.readFile(file, 'utf8'))
}

// Siembra productos y categorías con upsert por su clave estable (id), de modo
// que volver a correr el seed actualiza sin duplicar.
async function seedCatalog() {
  const products = await readSeedData('productos.json')
  await Product.bulkWrite(products.map((product) => ({
    updateOne: { filter: { id: product.id }, update: { $set: product }, upsert: true },
  })))

  const categories = await readSeedData('categorias.json')
  await Category.bulkWrite(categories.map((category) => ({
    updateOne: { filter: { id: category.id }, update: { $set: category }, upsert: true },
  })))

  return { products: products.length, categories: categories.length }
}

// Crea (o reafirma) un usuario admin para poder demostrar el panel. why: el login
// vive en el backend pero nadie nace admin; sin este seed no habría forma de
// probar las rutas protegidas por rol sin editar la base a mano.
async function seedAdmin() {
  const correo = env.adminEmail.toLowerCase()
  const contrasenna = await bcrypt.hash(env.adminPassword, await bcrypt.genSalt(10))
  await Usuario.updateOne(
    { correo },
    { $set: { nombre: env.adminName, correo, contrasenna, tipoUsuario: 'admin' } },
    { upsert: true },
  )
  return correo
}

async function seed() {
  assertDatabaseConfig()
  await connectDatabase(env.mongoUri)
  const { products, categories } = await seedCatalog()
  const adminEmail = await seedAdmin()
  console.log(`Seeded ${products} products and ${categories} categories`)
  console.log(`Admin ready: ${adminEmail} / ${env.adminPassword}`)
  await disconnectDatabase()
}

seed().catch(async (error) => {
  console.error(error)
  try { await disconnectDatabase() } catch {}
  process.exit(1)
})
