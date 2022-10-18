// import the server
const mongoose = require('mongoose');
const request = require('supertest');
const {app} = require('../src/server');

// establish a connection to the database 
const {databaseConnector, databaseDisconnector} = require('../src/database');
const DATABASE_URI = process.env.DATABASE_URI || 'mongodb://localhost:27017/SomeTestDatabase';

// set up before-tests and after-tests operations
beforeEach(async () => {
    await databaseConnector(DATABASE_URI);
});

afterEach(async () => {
    await databaseDisconnector();
});

// then we can write a tests 

describe('Server homepage...', () => {

    it("shows a hello message", async () => {
        const response = await request(app).get('/');
        expect(response.statusCode).toEqual(200);
        expect(response.text).toEqual(expect.stringContaining("Hello"));
    });

});


describe('Blog posts', () => { 
    it("lets you make a post", async () => {
        const response = await request(app).post('/blogs').send({
            postTitle:"some test post",
            postContent:"post content in a test",
            postAuthorID:"some author ID"
        });
        expect(response.statusCode).toEqual(200);
    })
 })

