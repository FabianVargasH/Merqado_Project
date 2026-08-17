const test = require('node:test')
const assert = require('node:assert/strict')
const { processPayment, nuevaReferencia } = require('../src/services/paymentGateway')

test('payment reference uses the PAY- prefix', () => {
  assert.match(nuevaReferencia(), /^PAY-[A-Z0-9]+$/)
})

test('processPayment authorizes the charge in colones', async () => {
  const pago = await processPayment({ montoCRC: 50000 })
  assert.equal(pago.autorizado, true)
  assert.equal(pago.montoCRC, 50000)
  assert.equal(pago.metodo, 'tarjeta')
  assert.match(pago.referencia, /^PAY-/)
})
