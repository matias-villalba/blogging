'use strict'
const mongoose = require('mongoose')

const authorSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, 'Author is required'] }
})

authorSchema.set('toJSON', {
  transform: (doc, ret, options) => {
    ret.id = ret._id
    delete ret._id
    delete ret.__v
    if (ret.user && Object.keys(ret.user).length === 0 && ret.user.constructor === Object) {
      delete ret.user
    }
    if (ret.user) {
      delete ret.user.password
    }
  }
})

const Author = mongoose.model('Author', authorSchema)

module.exports = Author
