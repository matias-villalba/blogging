const elasticsearch = require('elasticsearch')
const mongoose = require('mongoose')
const config = require('config')

const elasticsearchConnection = config.db.elasticsearchConnection
const mongodbConnection = config.db.mongodbConnection

const esClient = new elasticsearch.Client({ host: elasticsearchConnection })

mongoose.connect(mongodbConnection, { useNewUrlParser: true })
const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))

db.once('open', () => {
  console.log('connected to mongodb')
})

function getEsClientConnection () {
  return esClient
}

module.exports = { getEsClientConnection }
