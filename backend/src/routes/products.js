const express = require('express')
const Product = require('../models/Product')
const { authenticate, requireAdmin } = require('../middleware/auth')

const router = express.Router()

function productId(value) {
  const id = Number(value)
  return Number.isInteger(id) ? id : null
}

router.get('/', async (req, res) => {
  const filter = {}
  if (req.query.category) filter.categoria = String(req.query.category)
  if (req.query.discount === 'true') filter.descuento = true
  if (req.query.search) {
    const search = String(req.query.search).trim()
    if (search) filter.$or = [
      { nombre: { $regex: search, $options: 'i' } },
      { marca: { $regex: search, $options: 'i' } },
    ]
  }

  const sortMap = {
    priceAsc: { precio: 1 },
    priceDesc: { precio: -1 },
    rating: { calificacion: -1 },
    newest: { createdAt: -1 },
  }
  const products = await Product.find(filter).sort(sortMap[req.query.sort] || { id: 1 }).lean()
  res.json({ products })
})

router.get('/:id', async (req, res) => {
  const product = await Product.findOne({ id: productId(req.params.id) }).lean()
  if (!product) return res.status(404).json({ error: 'Product not found' })
  return res.json({ product })
})

router.post('/', authenticate, requireAdmin, async (req, res) => {
  const product = await Product.create({ ...req.body, id: req.body.id ?? Date.now() })
  res.status(201).json({ product })
})

router.patch('/:id', authenticate, requireAdmin, async (req, res) => {
  const product = await Product.findOneAndUpdate(
    { id: productId(req.params.id) },
    { $set: req.body },
    { new: true, runValidators: true },
  ).lean()
  if (!product) return res.status(404).json({ error: 'Product not found' })
  return res.json({ product })
})

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  const result = await Product.deleteOne({ id: productId(req.params.id) })
  if (!result.deletedCount) return res.status(404).json({ error: 'Product not found' })
  return res.status(204).send()
})

module.exports = router
