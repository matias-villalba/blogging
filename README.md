# Nodejs Blogging platform



## Implemented:

* Create posts
* List all post and get a post by id 
* Delete post
* List all authors and get one by id
* User authentication with JWT (signup and login are also implemented)
* It is implemented the feature which makes that an author only can create post under her/his name. This endpoint expects a token header (jwt).
* Text Search is implemented. It is used the Mongoose plugin: Mongoosastic, which allow us to use mongodb and elasticsearch without hiting directaly to each database.
* Thera are end-to-end tests implemented. I would have prefered adding some unit-test, but I couln't because of time.



## Requirements to Run the app
It is need to install mongodb, nodejs and elasticsearch. I've used the last version of each one.


## Configs
There is a config file at ./config/development.json
and there are two fiels to configure in order to run the app:
```
  "elasticsearchConnection": "http://localhost:9200",
  "mongodbConnection": "mongodb://localhost:27017"
```

## Start up the app
```
npm i
node app.js
```

## Run test
As I mentioned the tests are end-to-end, for this reason the app must be already running when we want run the tests.

And it should be configured the app host in the file:
./tests/end-to-end/config.js (this field is 'host')

(By the way, The app listens in the port 3008)

Once all is configured you can run:
```
npm run-script test:end-to-end
```

## Test the app with Postman
There is a postman collection at: 
./tools/bloggin.postman_collection.json

Once you have imported the postman collection. You can start to test the endpoints.
First, I would like to mention that there are three 'resources': the users, authors and posts.
User has the username and password which is used to signup and to login. 
On the other hand authors only have first name, last name and a user associated.
The posts have content, title and an author associated.

Then, 
* firstly you have to signup as a user with the endpoint: signup
* Once user is created, you should login with the endpoint login user, and get the token.
* Afte that you can create the author associated to the user. This can be done with the endpoint: create author.
In this enpoint you have to pass the username of the user. for instance:
```
{ 
            "firstName": "Foo",
            "lastName": "Baar",
            "user": {"username": "user12345"}
}
```
Besides that you have to use the token gotten in the previous step. the token must be in a header called 'token'
* Then you can create posts with the endpoint create post, and you also have to add the token header.
* If you want to list the post you can use the 'get posts' endpoint or search posts. 
Search post has the same path though it has q query string param: search.
You can do por instance:
```
http://localhost:3008/posts?search=sports
```



## Regarding the code
I am aware that there are missing some validations. And also the code quality can be improved. But I tried to focus more on completing the functional requirements, in few hours and on using the appropiated tools, dbs and libraries.










There is js script in tools directory, called 'create-admin-user-script.js' that is not been used. I added this one becase I wanted to add an adming user with permissions for add/remove users. But I couln't because of time. Anyway the mentioned endpoints are implemented as publics
