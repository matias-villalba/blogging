'use strict'
const mongoose = require('mongoose')

const mongodbConnection = 'mongodb://localhost:27017'
const User = require('../model/User')

mongoose.connect(mongodbConnection, { useNewUrlParser: true })
const db = mongoose.connection
db.on('error', (e) => {
  console.error('connection error', e)
  process.exit(e)
})

db.once('open', async () => {
  const admin = await User.create({ username: 'admin', password: 'admin' })
  console.log('user admin created:' + JSON.stringify(admin))
  process.exit()
})
