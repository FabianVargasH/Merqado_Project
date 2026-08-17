const express = require('express')
const mongoose = require('mongoose')
const Product = require('../models/Product')
const Order = require('../models/Order')
const { authenticate, optionalAuthenticate, requireAdmin } = require('../middleware/auth')
const { calculateOrderTotals, validateOrderItems } = require('../services/orderTotals')
const { processPayment } = require('../services/paymentGateway')

const router = express.Router()
const ORDER_STATES = ['Procesando', 'En camino', 'Entregado', 'Cancelado']

function getUserId(user) {
  return user?.id || user?.sub || null
}

function normalizeShipping(shipping = {}) {
  const fields = ['nombre', 'apellidos', 'provincia', 'canton', 'distrito', 'codigoPostal', 'direccion']
  const normalized = Object.fromEntries(fields.map((field) => [field, String(shipping[field] || '').trim()]))
  if (fields.some((field) => !normalized[field]) || !/^\d{5}$/.test(normalized.codigoPostal)) {
    const error = new Error('Complete valid shipping information')
    error.statusCode = 400
    throw error
  }
  return normalized
}

async function createOrder(req, res) {
  const { items, shipping } = req.body || {}
  validateOrderItems(items)
  const normalizedShipping = normalizeShipping(shipping)
  const requested = items.map((item) => ({ productId: Number(item.productId), quantity: Number(item.quantity) }))
  const ids = [...new Set(requested.map((item) => item.productId))]
  const products = await Product.find({ id: { $in: ids } }).lean()
  const byId = new Map(products.map((product) => [product.id, product]))
  if (products.length !== ids.length) {
    const error = new Error('One or more products do not exist')
    error.statusCode = 400
    throw error
  }

  const lines = requested.map((item) => {
    const product = byId.get(item.productId)
    return { productId: product.id, nombre: product.nombre, precio: product.precio, imagen: product.imagen, cantidad: item.quantity }
  })
  const totals = calculateOrderTotals(lines)

  const payment = await processPayment({ montoCRC: totals.total })
  const session = await mongoose.startSession()
  let order
  try {
    await session.withTransaction(async () => {
      for (const item of requested) {
        const updated = await Product.findOneAndUpdate(
          { id: item.productId, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { new: true, session },
        )
        if (!updated) {
          const error = new Error(`Insufficient stock for product ${item.productId}`)
          error.statusCode = 409
          throw error
        }
      }

      const userId = getUserId(req.user)
      const [created] = await Order.create([{
        numero: `MQ-${Math.floor(10000 + Math.random() * 90000)}`,
        fecha: new Date(),
        userId,
        usuario: req.user?.email || null,
        // Solo se referencia si el id es un ObjectId real (usuario local); los
        // tokens externos o invitados quedan en null.
        usuarioRef: mongoose.isValidObjectId(userId) ? userId : null,
        items: lines,
        shipping: normalizedShipping,
        ...totals,
        payment,
        estado: 'Procesando',
      }], { session })
      order = created
    })
  } finally {
    await session.endSession()
  }

  return res.status(201).json({ order })
}

router.post('/', optionalAuthenticate, createOrder)

router.get('/me', authenticate, async (req, res) => {
  const userId = getUserId(req.user)
  const orders = await Order.find({ userId }).sort({ createdAt: -1 }).lean()
  res.json({ orders })
})


router.get('/by-number/:numero', authenticate, async (req, res) => {
  const order = await Order.findOne({ numero: req.params.numero }).lean()
  if (!order) return res.status(404).json({ error: 'Order not found' })
  if (order.userId !== getUserId(req.user) && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not allowed to view this order' })
  }
  return res.json({ order })
})

router.get('/admin/all', authenticate, requireAdmin, async (req, res) => {
  // .populate() une cada orden con su usuario (relación ORM) para traer nombre y
  // correo desde la colección de usuarios sin guardarlos duplicados en la orden.
  const orders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(100)
    .populate('usuarioRef', 'nombre correo tipoUsuario')
    .lean()
  res.json({ orders })
})

router.patch('/admin/:id/status', authenticate, requireAdmin, async (req, res) => {
  if (!ORDER_STATES.includes(req.body?.estado)) return res.status(400).json({ error: 'Invalid order status' })
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { $set: { estado: req.body.estado } },
    { new: true, runValidators: true },
  ).lean()
  if (!order) return res.status(404).json({ error: 'Order not found' })
  return res.json({ order })
})

module.exports = router
