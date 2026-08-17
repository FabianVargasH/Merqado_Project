const test = require('node:test')
const assert = require('node:assert/strict')
const { getBearerToken, requireAdmin } = require('../src/middleware/auth')

test('extracts only bearer authorization tokens', () => {
  assert.equal(getBearerToken('Bearer abc123'), 'abc123')
  assert.equal(getBearerToken('Basic abc123'), null)
  assert.equal(getBearerToken(''), null)
})

test('rejects non-admin users at the authorization boundary', () => {
  let responseStatus
  let responseBody
  const res = {
    status(value) { responseStatus = value; return this },
    json(value) { responseBody = value; return this },
  }

  requireAdmin({ user: { role: 'customer' } }, res, () => assert.fail('customer was authorized'))
  assert.equal(responseStatus, 403)
  assert.deepEqual(responseBody, { error: 'Administrator role required' })
})

test('lets admin users through the authorization boundary', () => {
  let called = false
  requireAdmin({ user: { role: 'admin' } }, {}, () => { called = true })
  assert.equal(called, true)
})
