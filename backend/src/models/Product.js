const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true, index: true },
  nombre: { type: String, required: true, trim: true },
  marca: { type: String, default: '', trim: true },
  categoria: { type: String, required: true, trim: true, index: true },
  precio: { type: Number, required: true, min: 0 },
  precioAnterior: { type: Number, default: null },
  descuento: { type: Boolean, default: false },
  calificacion: { type: Number, default: 0, min: 0, max: 5 },
  resenas: { type: Number, default: 0, min: 0 },
  stock: { type: Number, required: true, min: 0 },
  imagen: { type: String, default: '' },
  descripcion: { type: String, default: '' },
  destacado: { type: Boolean, default: false },
  etiqueta: { type: String, default: null },
}, { timestamps: true })

module.exports = mongoose.model('Product', productSchema)
