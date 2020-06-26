'use strict'

const supertest = require('supertest')
const expect = require('chai').expect
const adminUsername = 'admin'
const adminPassword = 'admin'
const host = require('./config').host

const username = 'test-' + Date.now()
const password = 'pass-' + Date.now()
let userId

describe('User', function () {
  describe('Signup', function () {
    it('should create an user', async function () {
      const signUpResponse = await supertest(host).post('/users/signup')
        .send({ username, password })
        .expect(200)

      expect(signUpResponse).ok
      expect(signUpResponse.body).ok
      expect(signUpResponse.body.user).ok
      expect(signUpResponse.body.user.id).ok
      userId = signUpResponse.body.user.id
      expect(signUpResponse.body.user.password).to.be.undefined
      expect(signUpResponse.body.user.username).to.be.equal(username)
    })
    it('should not create an user without username', async function () {
      const signUpResponse = await supertest(host).post('/users/signup')
        .send({ password })
        .expect(400)
    })
    it('should not create an user without password', async function () {
      const signUpResponse = await supertest(host).post('/users/signup')
        .send({ username })
        .expect(400)

    })
  })

  describe('Admin', function () {
    it('should get the user by id', async function () {
      const signUpResponse = await supertest(host).get(`/users/${userId}`)
        .send()
        .expect(200)

      expect(signUpResponse).ok
      expect(signUpResponse.body).ok
      expect(signUpResponse.body.username).ok
      expect(signUpResponse.body.password).to.be.undefined
      expect(signUpResponse.body.id).to.be.equal(userId)
      expect(signUpResponse.body.username).to.be.equal(username)
    })


    it('should delete the user', async function () {
      const signUpResponse = await supertest(host).del(`/users/${userId}`)
        .send()
        .expect(200)

      expect(signUpResponse).ok
      expect(signUpResponse.body).ok
      expect(signUpResponse.body.username).ok
      expect(signUpResponse.body.password).to.be.undefined
      expect(signUpResponse.body.id).to.be.equal(userId)
      expect(signUpResponse.body.username).to.be.equal(username)
    })
  })

  after(async () => {
    try { //just in case that the user was not deleted
      if (userId) {
        await supertest(host).del(`/users/signup${userId}`)
      }
    } catch (error) {
      console.log(error)
    }

  })
})
