const express = require('express')
const Category = require('../models/Category')
const Product = require('../models/Product')
const { authenticate, requireAdmin } = require('../middleware/auth')

const router = express.Router()


function slugify(value) {
  return String(value || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}


router.get('/', async (req, res) => {
  const categories = await Category.find().sort({ nombre: 1 }).lean()
  const counts = await Product.aggregate([
    { $group: { _id: '$categoria', total: { $sum: 1 } } },
  ])
  const totalPorCategoria = new Map(counts.map((c) => [c._id, c.total]))
  res.json({ categories: categories.map((c) => ({ ...c, productos: totalPorCategoria.get(c.id) || 0 })) })
})

router.get('/:id', async (req, res) => {
  const category = await Category.findOne({ id: String(req.params.id).toLowerCase() }).lean()
  if (!category) return res.status(404).json({ error: 'Category not found' })
  return res.json({ category })
})

router.post('/', authenticate, requireAdmin, async (req, res) => {
  const id = slugify(req.body.id || req.body.nombre)
  if (!id || !req.body.nombre) return res.status(400).json({ error: 'A category name is required' })
  if (await Category.exists({ id })) return res.status(409).json({ error: 'Category already exists' })
  const category = await Category.create({ nombre: req.body.nombre, icono: req.body.icono, id })
  res.status(201).json({ category })
})

router.patch('/:id', authenticate, requireAdmin, async (req, res) => {

  const { id, ...cambios } = req.body
  const category = await Category.findOneAndUpdate(
    { id: String(req.params.id).toLowerCase() },
    { $set: cambios },
    { new: true, runValidators: true },
  ).lean()
  if (!category) return res.status(404).json({ error: 'Category not found' })
  return res.json({ category })
})

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  const id = String(req.params.id).toLowerCase()

  if (await Product.exists({ categoria: id })) {
    return res.status(409).json({ error: 'Cannot delete a category that still has products' })
  }
  const result = await Category.deleteOne({ id })
  if (!result.deletedCount) return res.status(404).json({ error: 'Category not found' })
  return res.status(204).send()
})

module.exports = router
