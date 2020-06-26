'use strict'

const supertest = require('supertest')
const expect = require('chai').expect
const host = require('./config').host

const username = 'test-' + Date.now()
const password = 'pass-' + Date.now()

const anotherUsername = 'test2-' + Date.now()

let userId
let token
let authorId
let tokenOfAnotherUser

const firstName = "Foo"
const lastName = "Bar"

describe('Author', function () {
    this.timeout(50000)
    before(async () => {
        await supertest(host).post('/users/signup')
            .send({ username, password })
            .expect(200)
        const loginResponse = await supertest(host).post('/users/login')
            .send({ username, password })
        expect(loginResponse.body).ok
        expect(loginResponse.body.token).ok
        expect(loginResponse.body).to.have.property('token').that.is.a('string')
        token = loginResponse.body.token


        await supertest(host).post('/users/signup')
            .send({ username: anotherUsername, password })
            .expect(200)
        const anotherLoginResponse = await supertest(host).post('/users/login')
            .send({ username: anotherUsername, password })
        expect(anotherLoginResponse.body).ok
        expect(anotherLoginResponse.body.token).ok
        expect(anotherLoginResponse.body).to.have.property('token').that.is.a('string')
        tokenOfAnotherUser = anotherLoginResponse.body.token

    })
    describe('Creation', function () {
        it('should create an author associated to an existent user', async function () {
            const loginResponse = await supertest(host).post('/authors')
                .send({
                    firstName: "Foo",
                    lastName: "Bar",
                    user: { username: username }
                })
                .set('token', token)
                .expect(200)

            expect(loginResponse).ok
            expect(loginResponse.body).ok
            expect(loginResponse.body.firstName).to.be.equal(firstName)
            expect(loginResponse.body.lastName).to.be.equal(lastName)
            expect(loginResponse.body).to.have.property('id').that.is.a('string')
            authorId = loginResponse.body.id
        })


        it('should not create an author when the username doesnt match with the user of the token passed', async function () {
            await supertest(host).post('/authors')
                .send({
                    firstName,
                    lastName,
                    user: { username: username }
                })
                .set('token', tokenOfAnotherUser)
                .expect(401)

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
        try { //just in case that the user was not deleted
            if (authorId) {
                await supertest(host).del('/authors/' + authorId)
                    .send()
                    .set('token', token)
            }
        } catch (error) {
            console.log(error)
        }


    })
})
