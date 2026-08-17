const mongoose = require('mongoose')

// Ítem del carrito. Se guarda lo mínimo para pintarlo sin volver a consultar el
// producto; el precio real se recalcula contra la base al crear la orden.
const cartItemSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  nombre: { type: String, required: true },
  precio: { type: Number, required: true, min: 0 },
  imagen: { type: String, default: '' },
  cantidad: { type: Number, required: true, min: 1 },
}, { _id: false })

// Carrito = un documento por usuario (userId único). why en la base y no en
// localStorage: es una de las entidades del dominio y así el carrito sigue al
// usuario entre dispositivos/sesiones, con la base como única fuente de verdad.
const cartSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, index: true },
  items: { type: [cartItemSchema], default: [] },
}, { timestamps: true })

module.exports = mongoose.model('Cart', cartSchema)
