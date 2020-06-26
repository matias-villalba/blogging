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
let firstPostId

const firstName = "Foo"
const lastName = "Bar"


const title1 =  "A test post 1"
const content1 = "this is the content of a post, it is the first"


describe('Posts', function () {
    this.timeout(5000)
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
            .send({ username: anotherUsername, password})
            .expect(200)
        const anotherLoginResponse = await supertest(host).post('/users/login')
            .send({ username: anotherUsername, password })
        expect(anotherLoginResponse.body).ok
        expect(anotherLoginResponse.body.token).ok
        expect(anotherLoginResponse.body).to.have.property('token').that.is.a('string')
        tokenOfAnotherUser = anotherLoginResponse.body.token

        const authorRes = await supertest(host).post('/authors')
        .send({
            firstName: "Foo",
            lastName: "Bar",
            user: { username: username }
        })
        .set('token', token)
        authorId = authorRes.body.id
    })
    describe('Creation', function () {
        it('should create a post with the author associated', async function () {
            const postResponse = await supertest(host).post('/posts')
                .send({ 
                    title: title1,
                    content: content1,
                    author : {id: authorId}
                })
                .set('token', token)
                .expect(200)

            expect(postResponse).ok
            expect(postResponse.body).ok
            expect(postResponse.body.title).to.be.equal(title1)
            expect(postResponse.body.content).to.be.equal(content1)
            expect(postResponse.body).to.have.property('id').that.is.a('string')
            firstPostId = postResponse.body.id
        })

        it('should not create a post without an author associated', async function () {
            await supertest(host).post('/posts')
                .send({ 
                    title: "A test post 1",
                    content: "this is the content of a post, it is the first",
                    author : {id: 'noexistentid'}
                })
                .set('token', token)
                .expect(400)
        })


    })
    describe('Search', function () {
        it('should find results searching by words ', async function () {
            this.timeout(69999)

            const commonWord = 'aWordCommon'+Date.now()
            const title1 = 'first title'
            const content1 = `this is a test which has ${commonWord} and characteres and also spaces`

            const title2 = 'second title'
            const content2 = `this is a code which can be used for testing and has characteres a lot of words`


            const title3 = 'tirth title'
            const content3 = `this directory has a path, and that path has a ${commonWord} and different characteres like a text book`


            await supertest(host).post('/posts')
                .send({ 
                    title: title1,
                    content: content1,
                    author : {id: authorId}
                })
                .set('token', token)
                .expect(200)
           await supertest(host).post('/posts')
                .send({ 
                    title: title2,
                    content: content2,
                    author : {id: authorId}
                })
                .set('token', token)
                .expect(200)
           await supertest(host).post('/posts')
                .send({ 
                    title: title3,
                    content: content3,
                    author : {id: authorId}
                })
                .set('token', token)
                .expect(200)
  
        await new Promise(resolve => setTimeout(resolve , 2000)) // the syncronization with elasticsearch delays a milliseconds and it is asyncronous      
        const postResponse = await supertest(host).get( `/posts?search=${commonWord}`)
                .send()
                .expect(200)


            expect(postResponse).ok
            expect(postResponse.body).ok
            expect(postResponse.body.length).to.be.equal(2)

            const result = postResponse.body.filter(post => post.content === content1 || post.content === content3 );

            const isInsameOrder = result[0].content === content1? true : false

            const i = isInsameOrder? 0: 1
            expect(postResponse.body[i]).ok
            expect(postResponse.body[i]).to.have.property('id').that.is.a('string')
            expect(postResponse.body[i].content).to.be.equal(content1)
            expect(postResponse.body[i].title).to.be.equal(title1)


            const j = isInsameOrder? 1: 0
            expect(postResponse.body[j]).ok
            expect(postResponse.body[j]).to.have.property('id').that.is.a('string')
            expect(postResponse.body[j].content).to.be.equal(content3)
            expect(postResponse.body[j].title).to.be.equal(title3)



            firstPostId = postResponse.body.id
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
