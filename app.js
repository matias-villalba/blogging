'use strict'
const bodyParser = require('body-parser')
const express = require('express')
require('./db/connections')
require('./auth/auth')
const fs = require('fs')
const routePath = './routes'

const app = express()
const port = 3008
app.use(bodyParser.json())

fs.readdirSync(routePath).forEach((file) => require(`${routePath}/${file}`)(app))

app.use((err, req, res, next) => {
  console.error(err.stack)
  return err.code ? res.status(err.code).send(err.message)
    : res.status(500).send('Inernal error')
})

app.listen(port, () => console.log(`Server listening on port: ${port}`))
