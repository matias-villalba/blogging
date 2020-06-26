'use strict'
const User = require('../model/User')
const passport = require('passport')
const jwt = require('jsonwebtoken')

const config = require('config')
const jwtkey = config.jwtsecret
const minutesOfTokenExpiration = config.minutesOfTokenExpiration

const HttpError = require('standard-http-error')

module.exports = function (app) {
  // When the user sends a post request to this route, passport authenticates the user based on the
  // middleware created previously

  app.post('/users/signup', passport.authenticate('signup', { session: false }), async (req, res, next) => {
    res.json({
      message: 'Signup successful',
      user: {
        username: req.user.username,
        id: req.user._id
      }
    })
  })

  app.post('/users/login', async (req, res, next) => {
    passport.authenticate('login', async (err, user, info) => {
      try {
        if (err) {
          console.log(err)
          const error = new HttpError(500, 'An Error occurred')
          return next(error)
        }
        if (!user) {
          const error = new HttpError(401, 'invalid authentication')
          return next(error)
        }

        req.login(user, { session: false }, async (error) => {
          if (error) return next(error)
          const body = { _id: user._id, username: user.username }
          const token = jwt.sign({ user: body }, jwtkey, { expiresIn: 60 * minutesOfTokenExpiration })
          return res.json({ token })
        })
      } catch (error) {
        return next(error)
      }
    })(req, res, next)
  })


  app.get('/users/:userId', async (req, res, next) => {
    try {
      const user = await User.findById(req.params.userId)
      if (!user) {
        return res.status(404).send('User not found')
      }
      user.password = undefined
      res.json(user)
    } catch (e) {
      next(e)
    }
  })

  app.delete('/users/:userId', async (req, res, next) => {
    try {
      const user = await User.findByIdAndDelete(req.params.userId)
      if (!user) {
        return res.status(404).send('User not found')
      }
      user.password = undefined
      res.json(user)
    } catch (e) {
      next(e)
    }
  })
}
