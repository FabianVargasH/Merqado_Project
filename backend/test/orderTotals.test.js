const test = require('node:test')
const assert = require('node:assert/strict')
const { IVA, calculateOrderTotals, validateOrderItems } = require('../src/services/orderTotals')

test('breaks an IVA-inclusive price into base subtotal + IVA that sum to the total', () => {
  const totals = calculateOrderTotals([
    { precio: 1000, cantidad: 2 },
    { precio: 500, cantidad: 1 },
  ], 0)

  assert.equal(IVA, 0.13)
  // Precios con IVA incluido: total 2500; iva = round(2500 * 13/113) = 288;
  // subtotal (base) = 2500 - 288 = 2212. subtotal + iva = total.
  assert.deepEqual(totals, { subtotal: 2212, iva: 288, envio: 0, total: 2500 })
  assert.equal(totals.subtotal + totals.iva + totals.envio, totals.total)
})

test('rejects empty or invalid order items', () => {
  assert.throws(() => validateOrderItems([]), /at least one order item/i)
  assert.throws(() => validateOrderItems([{ productId: 1, quantity: 0 }]), /positive integer quantity/i)
})
