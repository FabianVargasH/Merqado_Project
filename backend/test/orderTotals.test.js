const test = require('node:test')
const assert = require('node:assert/strict')
const { IVA, calculateOrderTotals, validateOrderItems } = require('../src/services/orderTotals')

test('calculates subtotal, Costa Rican IVA, shipping, and total', () => {
  const totals = calculateOrderTotals([
    { precio: 1000, cantidad: 2 },
    { precio: 500, cantidad: 1 },
  ], 0)

  assert.equal(IVA, 0.13)
  assert.deepEqual(totals, { subtotal: 2500, iva: 325, envio: 0, total: 2825 })
})

test('rejects empty or invalid order items', () => {
  assert.throws(() => validateOrderItems([]), /at least one order item/i)
  assert.throws(() => validateOrderItems([{ productId: 1, quantity: 0 }]), /positive integer quantity/i)
})
