'use strict'

const supertest = require('supertest')
const expect = require('chai').expect
const host = require('./config').host



const username = 'test-' + Date.now()
const password = 'pass-' + Date.now()
let userId
let token


describe('Login', function () {
    before(async () => {
        await supertest(host).post('/users/signup')
            .send({ username, password })
            .expect(200)

    })

    it('should login and return a valid token', async function () {
        const loginResponse = await supertest(host).post('/users/login')
            .send({ username, password })
            .expect(200)

        expect(loginResponse).ok
        expect(loginResponse.body).ok
        expect(loginResponse.body.token).ok
        expect(loginResponse.body).to.have.property('token').that.is.a('string')
        token = loginResponse.body.token
    })

    it('should not login when password is incorrect', async function () {
        const loginResponse = await supertest(host).post('/users/login')
            .send({ username, password: 'anIncorrectPassword' })
            .expect(401)

        expect(loginResponse).ok
        expect(loginResponse.body).ok
        expect(loginResponse.body.token).to.be.undefined
    })


    it('should not login when username is incorrect', async function () {
        const loginResponse = await supertest(host).post('/users/login')
            .send({ username: 'novalidusername', password })
            .expect(401)

        expect(loginResponse).ok
        expect(loginResponse.body).ok
        expect(loginResponse.body.token).to.be.undefined
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
