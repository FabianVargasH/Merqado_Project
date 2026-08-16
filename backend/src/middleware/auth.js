const jwt = require('jsonwebtoken')
const { env } = require('../config/env')
const Usuario = require('../models/usuarios.model')

function getBearerToken(header = '') {
  const [scheme, token] = header.split(' ')
  return scheme?.toLowerCase() === 'bearer' ? token : null
}

async function resolveUser(decoded) {
  if (decoded.role || decoded.email) {
    return {
      ...decoded,
      id: decoded.id || decoded.sub,
      role: decoded.role || 'customer',
    }
  }

  const usuario = await Usuario.findById(decoded.id).select('-contrasenna').lean()
  if (!usuario) return null
  return {
    id: String(usuario._id),
    email: usuario.correo,
    role: usuario.tipoUsuario === 'admin' ? 'admin' : 'customer',
  }
}

async function authenticate(req, res, next) {
  const token = getBearerToken(req.headers.authorization)

  if (!token || !env.jwtSecret) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  try {
    req.user = await resolveUser(jwt.verify(token, env.jwtSecret))
    if (!req.user) return res.status(401).json({ error: 'Invalid user' })
    return next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

async function optionalAuthenticate(req, res, next) {
  const token = getBearerToken(req.headers.authorization)
  if (!token || !env.jwtSecret) return next()

  try {
    req.user = await resolveUser(jwt.verify(token, env.jwtSecret))
    if (!req.user) return res.status(401).json({ error: 'Invalid user' })
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
  return next()
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Administrator role required' })
  }
  return next()
}

module.exports = { authenticate, optionalAuthenticate, requireAdmin, getBearerToken }
