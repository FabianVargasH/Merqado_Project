const mongoose = require('mongoose')

const addressSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  etiqueta: { type: String, required: true, trim: true },
  predeterminada: { type: Boolean, default: false },
  provincia: { type: String, required: true, trim: true },
  canton: { type: String, required: true, trim: true },
  distrito: { type: String, required: true, trim: true },
  senas: { type: String, default: '', trim: true },
  codigoPostal: { type: String, required: true, match: /^\d{5}$/ },
}, { timestamps: true })

module.exports = mongoose.model('Address', addressSchema)
