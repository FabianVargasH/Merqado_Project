const express = require('express')
const { getProvincias, getCantones, getDistritos } = require('../services/crLocations')

const router = express.Router()


router.get('/provincias', async (req, res) => {
  try {
    res.json({ provincias: await getProvincias() })
  } catch {
    res.status(502).json({ error: 'No se pudieron obtener las provincias' })
  }
})

router.get('/provincia/:provincia/cantones', async (req, res) => {
  try {
    res.json({ cantones: await getCantones(req.params.provincia) })
  } catch {
    res.status(502).json({ error: 'No se pudieron obtener los cantones' })
  }
})

router.get('/provincia/:provincia/canton/:canton/distritos', async (req, res) => {
  try {
    res.json({ distritos: await getDistritos(req.params.provincia, req.params.canton) })
  } catch {
    res.status(502).json({ error: 'No se pudieron obtener los distritos' })
  }
})

module.exports = router
