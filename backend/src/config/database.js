const mongoose = require('mongoose')

async function connectDatabase(uri) {
  await mongoose.connect(uri)
  return mongoose.connection
}

async function disconnectDatabase() {
  await mongoose.disconnect()
}

module.exports = { connectDatabase, disconnectDatabase }
