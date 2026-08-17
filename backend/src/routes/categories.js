const express = require('express')
const Category = require('../models/Category')
const Product = require('../models/Product')
const { authenticate, requireAdmin } = require('../middleware/auth')

const router = express.Router()

// Normaliza un texto libre a slug: sin acentos, minúsculas y con guiones. Se usa
// para derivar `id` cuando el admin crea una categoría escribiendo solo el nombre.
function slugify(value) {
  return String(value || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// GET /api/categories — lista pública ordenada por nombre. Incluye cuántos
// productos hay en cada categoría (relación Category.id ↔ Product.categoria) para
// que el panel del admin muestre el conteo sin una segunda petición.
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
  // El slug `id` es la clave que referencian los productos: no se reescribe en un
  // update, solo el nombre/ícono visibles. Así ningún producto queda huérfano.
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
  // No permitimos borrar una categoría con productos: dejaría productos "huérfanos"
  // que ningún filtro del catálogo mostraría. El admin debe reasignarlos primero.
  if (await Product.exists({ categoria: id })) {
    return res.status(409).json({ error: 'Cannot delete a category that still has products' })
  }
  const result = await Category.deleteOne({ id })
  if (!result.deletedCount) return res.status(404).json({ error: 'Category not found' })
  return res.status(204).send()
})

module.exports = router
