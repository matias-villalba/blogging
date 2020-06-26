'use strict'
const util = require('util')
const mongoose = require('mongoose')
const mongoosastic = require('mongoosastic')
const { getEsClientConnection } = require('../db/connections')

const postSchema = new mongoose.Schema({
  title: String,
  content: { type: String, es_indexed: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'Author', required: [true, 'Author is required'] }
})

postSchema.set('toJSON', {
  transform: (doc, ret, options) => {
    ret.id = ret._id
    delete ret._id
    delete ret.__v
  }
})

postSchema.plugin(mongoosastic, {
  esClient: getEsClientConnection()
})

const Post = mongoose.model('Post', postSchema)

Post.createMapping(function (err, mapping) {
  if (err) {
    console.log('error creating mapping (you can safely ignore this)')
    console.log(err)
  } else {
    console.log('mapping created!')
    console.log(mapping)
  }
})

Post.promisifySearch = util.promisify(Post.search)

module.exports = Post
