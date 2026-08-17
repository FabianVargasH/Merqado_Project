const IVA = 0.13

function calculateOrderTotals(items, shippingCost = 0) {
  
  const montoConIva = items.reduce((sum, item) => sum + item.precio * item.cantidad, 0)
  const iva = Math.round(montoConIva * (IVA / (1 + IVA)))
  const subtotal = montoConIva - iva
  return { subtotal, iva, envio: shippingCost, total: montoConIva + shippingCost }
}

function validateOrderItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    const error = new Error('At least one order item is required')
    error.statusCode = 400
    throw error
  }

  for (const item of items) {
    if (!Number.isInteger(Number(item.productId)) || !Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1) {
      const error = new Error('Each item needs a valid productId and positive integer quantity')
      error.statusCode = 400
      throw error
    }
  }
}

module.exports = { IVA, calculateOrderTotals, validateOrderItems }
