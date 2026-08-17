const mongoose = require('mongoose')

const orderItemSchema = new mongoose.Schema({
  productId: { type: Number, required: true },
  nombre: { type: String, required: true },
  precio: { type: Number, required: true, min: 0 },
  imagen: { type: String, default: '' },
  cantidad: { type: Number, required: true, min: 1 },
}, { _id: false })

// Comprobante del pago simulado. El monto queda en colones (moneda de la tienda).
const paymentSchema = new mongoose.Schema({
  metodo: { type: String, default: 'tarjeta' },
  referencia: { type: String, required: true },
  montoCRC: { type: Number, required: true, min: 0 },
  autorizado: { type: Boolean, default: true },
  procesadoEn: { type: Date, default: Date.now },
}, { _id: false })

const shippingSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellidos: { type: String, required: true },
  provincia: { type: String, required: true },
  canton: { type: String, required: true },
  distrito: { type: String, required: true },
  codigoPostal: { type: String, required: true, match: /^\d{5}$/ },
  direccion: { type: String, required: true },
}, { _id: false })

const orderSchema = new mongoose.Schema({
  numero: { type: String, required: true, unique: true, index: true },
  fecha: { type: Date, default: Date.now },
  userId: { type: String, default: null, index: true },
  usuario: { type: String, default: null },
  // Relación con ORM: referencia (ObjectId) al documento del usuario que hizo la
  // orden. Permite unir con la colección de usuarios vía .populate() sin duplicar
  // datos. Es null para invitados o tokens externos que no son ObjectId de Mongo.
  usuarioRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', default: null, index: true },
  items: { type: [orderItemSchema], required: true },
  shipping: { type: shippingSchema, required: true },
  subtotal: { type: Number, required: true, min: 0 },
  iva: { type: Number, required: true, min: 0 },
  envio: { type: Number, required: true, min: 0, default: 0 },
  total: { type: Number, required: true, min: 0 },
  payment: { type: paymentSchema, default: null },
  estado: { type: String, enum: ['Procesando', 'En camino', 'Entregado', 'Cancelado'], default: 'Procesando' },
}, { timestamps: true })

module.exports = mongoose.model('Order', orderSchema)
