const Author = require('../model/Author')
const User = require('../model/User')
const HttpError = require('standard-http-error')
const passport = require('passport')


module.exports = function (app) {
  app.post('/authors', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
    try {
      if (!req.body.user.username || req.body.user.username !== req.user.username) {
        throw new HttpError(401, 'the token is not associated to the author.user passed')
      }

      const user = await User.findOne({ username: req.body.user.username })
      if (!user) {
        throw new HttpError(400, 'author not found.')
      }

      const post = new Author({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        user
      })
      const savedAuthor = await post.save()
      res.json(savedAuthor)
    } catch (e) {
      next(e)
    }
  })

  app.get('/authors', async (req, res, next) => {
    try {
      const authors = await Author.find()

      res.json(authors)
    } catch (e) {
      next(e)
    }
  })

  app.get('/authors/:authorId', async (req, res, next) => {
    try {
      const author = await Author.findById(req.params.authorId)
      author ? res.json(author)
        : res.status(404).send('author not found')
    } catch (e) {
      next(e)
    }
  })

  app.delete('/authors/:authorId', async (req, res, next) => {
    try {
      const author = await Author.findByIdAndDelete(req.params.authorId)
      author ? res.json(author)
        : res.status(404).send('author not found')
    } catch (e) {
      next(e)
    }
  })
}
