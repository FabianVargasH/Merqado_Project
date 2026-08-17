const mongoose = require('mongoose')


const categorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
  nombre: { type: String, required: true, trim: true },
  icono: { type: String, default: 'bi-tag', trim: true },
}, { timestamps: true })

module.exports = mongoose.model('Category', categorySchema)
