const Post = require('../model/Post')
const Author = require('../model/Author')
const HttpError = require('standard-http-error')
const passport = require('passport')
var ObjectId = require('mongoose').Types.ObjectId

module.exports = function (app) {
  app.post('/posts', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
    try {
      if (!ObjectId.isValid(req.body.author.id)) {
        throw new HttpError(400, 'author not found.')
      }

      const author = await Author.findById(req.body.author.id).populate('user').exec()
      if (!author) {
        throw new HttpError(400, 'author not found.')
      }
      if (!author.user || author.user.username !== req.user.username) {
        throw new HttpError(401, 'user doesnt have permission for posting')
      }

      const post = new Post({
        title: req.body.title,
        author: author,
        content: req.body.content
      })
      const savedPost = await post.save()

      post.on('es-indexed', (err, result, next) => {
        if (err) {
          console.log(err)
          res.status(500).send('Inernal error saving data in elasticsearch')
        }
        res.json(savedPost)

      })

     
    } catch (e) {
      next(e)
    }
  })

  app.get('/posts', async (req, res, next) => {
    try {
      if (req.query.search) {
        const posts = await Post.promisifySearch({ query_string: { query: req.query.search } }, { hydrate: true })
        res.json(posts.hits.hits)
      } else {
        const posts = await Post.find().populate('author').exec()
        res.json(posts)
      }
    } catch (e) {
      next(e)
    }
  })

  app.get('/posts/:postId', async (req, res, next) => {
    try {
      const post = await Post.findById(req.params.postId).populate('author').exec()
      post ? res.json(post)
        : res.status(404).send('post not found')
    } catch (e) {
      next(e)
    }
  })

  app.delete('/posts/:postId', async (req, res, next) => {
    try {
      const post = await Post.findByIdAndDelete(req.params.postId).populate('author').exec()
      post ? res.json(post)
        : res.status(404).send('post not found')
    } catch (e) {
      next(e)
    }
  })
}
