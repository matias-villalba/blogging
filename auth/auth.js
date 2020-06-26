const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const User = require('../model/User')
const JWTstrategy = require('passport-jwt').Strategy
const ExtractJWT = require('passport-jwt').ExtractJwt
const jwtkey = require('config').jwtsecret


passport.use('signup', new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password'
}, async (username, password, next) => {
  try {
    const user = await User.create({ username, password })
    return next(null, user)
  } catch (error) {
    next(error)
  }
}))

// Create a passport middleware to handle User login
passport.use('login', new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password'
}, async (username, password, next) => {
  try {
    const user = await User.findOne({ username })
    if (!user) {
      return next(null, false, { message: 'User not found' })
    }
    const validate = await user.isValidPassword(password)
    if (!validate) {
      return next(null, false, { message: 'Wrong Password' })
    }
    return next(null, user, { message: 'Logged in Successfully' })
  } catch (error) {
    return next(error)
  }
}))

passport.use(new JWTstrategy({
  secretOrKey: jwtkey,
  jwtFromRequest: ExtractJWT.fromHeader('token')
}, async (token, next) => {
  try {
    // Pass the user details to the next middleware
    return next(null, token.user)
  } catch (error) {
    next(error)
  }
}))

module.exports = passport
