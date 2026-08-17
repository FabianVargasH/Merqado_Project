const mongoose = require('mongoose')

// Categoría del catálogo. Antes vivía en frontend/src/data/categorias.json; ahora
// es una colección propia para que el admin pueda crear/editar/eliminar sin tocar
// código ni redeploys.
//
// why `id` es un slug (p. ej. "electronica") y no el ObjectId: los productos ya
// referencian la categoría por ese slug (Product.categoria), así que mantenerlo
// como clave estable relaciona ambas colecciones sin migrar los productos
// existentes a ObjectId.
const categorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
  nombre: { type: String, required: true, trim: true },
  icono: { type: String, default: 'bi-tag', trim: true },
}, { timestamps: true })

module.exports = mongoose.model('Category', categorySchema)
