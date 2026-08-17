const express = require('express')
const Cart = require('../models/Cart')
const { authenticate } = require('../middleware/auth')

const router = express.Router()


router.use(authenticate)

function getUserId(user) {
  const id = user?.id || user?.sub
  return id ? String(id) : null
}

// Rechaza tokens sin identificador de usuario (p. ej. externos incompletos): sin un
// id válido no se puede aislar el carrito y se mezclarían entre usuarios inválidos.
router.use((req, res, next) => {
  if (!getUserId(req.user)) return res.status(401).json({ error: 'Invalid user' })
  return next()
})

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


router.get('/', async (req, res) => {
  const cart = await Cart.findOne({ userId: getUserId(req.user) }).lean()
  res.json({ cart: cart || { items: [] } })
})

router.put('/', async (req, res) => {
  const items = sanitizeItems(req.body.items)
  const cart = await Cart.findOneAndUpdate(
    { userId: getUserId(req.user) },
    { $set: { items } },
    { new: true, upsert: true, runValidators: true },
  ).lean()
  res.json({ cart })
})

router.delete('/', async (req, res) => {
  await Cart.findOneAndUpdate(
    { userId: getUserId(req.user) },
    { $set: { items: [] } },
    { upsert: true },
  )
  res.status(204).send()
})

module.exports = router
