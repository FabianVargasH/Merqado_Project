const express = require('express')
const Cart = require('../models/Cart')
const { authenticate } = require('../middleware/auth')

const router = express.Router()

// Todo el carrito requiere sesión: pertenece a un usuario. Los invitados manejan
// el carrito en memoria en el frontend hasta que inician sesión.
router.use(authenticate)

function getUserId(user) {
  return String(user.id || user.sub)
}

// Deja los ítems con solo los campos esperados y tipos correctos. why: nunca
// confiamos en la forma del body; el precio de referencia se revalida al ordenar.
function sanitizeItems(items) {
  if (!Array.isArray(items)) return []
  return items
    .map((item) => ({
      id: Number(item.id),
      nombre: String(item.nombre || ''),
      precio: Number(item.precio),
      imagen: String(item.imagen || ''),
      cantidad: Math.max(1, Math.floor(Number(item.cantidad) || 1)),
    }))
    .filter((item) => Number.isInteger(item.id) && item.precio >= 0)
}

// GET /api/cart — carrito del usuario (vacío si aún no tiene).
router.get('/', async (req, res) => {
  const cart = await Cart.findOne({ userId: getUserId(req.user) }).lean()
  res.json({ cart: cart || { items: [] } })
})

// PUT /api/cart — reemplaza el carrito completo. El frontend es dueño del estado
// del carrito y lo sincroniza entero tras cada cambio (upsert).
router.put('/', async (req, res) => {
  const items = sanitizeItems(req.body.items)
  const cart = await Cart.findOneAndUpdate(
    { userId: getUserId(req.user) },
    { $set: { items } },
    { new: true, upsert: true, runValidators: true },
  ).lean()
  res.json({ cart })
})

// DELETE /api/cart — vacía el carrito (p. ej. tras una compra).
router.delete('/', async (req, res) => {
  await Cart.findOneAndUpdate(
    { userId: getUserId(req.user) },
    { $set: { items: [] } },
    { upsert: true },
  )
  res.status(204).send()
})

module.exports = router
