const express = require('express')
const Address = require('../models/Address')
const { authenticate } = require('../middleware/auth')

const router = express.Router()

router.use(authenticate)

router.get('/', async (req, res) => {
  const addresses = await Address.find({ userId: String(req.user.id || req.user.sub) }).sort({ predeterminada: -1, createdAt: -1 }).lean()
  res.json({ addresses })
})

router.post('/', async (req, res) => {
  const userId = String(req.user.id || req.user.sub)
  const shouldDefault = Boolean(req.body.predeterminada) || !(await Address.exists({ userId }))
  if (shouldDefault) await Address.updateMany({ userId }, { $set: { predeterminada: false } })
  const address = await Address.create({ ...req.body, userId, predeterminada: shouldDefault })
  res.status(201).json({ address })
})

router.patch('/:id', async (req, res) => {
  const userId = String(req.user.id || req.user.sub)
  if (req.body.predeterminada) await Address.updateMany({ userId }, { $set: { predeterminada: false } })
  const address = await Address.findOneAndUpdate(
    { _id: req.params.id, userId },
    { $set: req.body },
    { new: true, runValidators: true },
  ).lean()
  if (!address) return res.status(404).json({ error: 'Address not found' })
  return res.json({ address })
})

router.delete('/:id', async (req, res) => {
  const result = await Address.deleteOne({ _id: req.params.id, userId: String(req.user.id || req.user.sub) })
  if (!result.deletedCount) return res.status(404).json({ error: 'Address not found' })
  return res.status(204).send()
})

module.exports = router
