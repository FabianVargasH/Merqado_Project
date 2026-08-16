const test = require('node:test')
const assert = require('node:assert/strict')
const { healthHandler } = require('../src/routes/health')

test('health handler returns an API status without a database request', () => {
  let body
  healthHandler({}, { json(value) { body = value; return this } })
  assert.deepEqual(body, { status: 'ok' })
})
