var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../app');
var should = chai.should();

chai.use(chaiHttp);

/**
 * This is where you write your tests. Make sure you follow the structure of the 'Register User' test. 
 * This website helped me writing these tests: http://mherman.org/blog/2015/09/10/testing-node-js-with-mocha-and-chai/
 * 
 * To run all test go to the /turnip-api/ folder and run 'npm test'
 */

describe('Register User', function() {
    it('should add user TESTING SERVER to the user database on /auth/signup POST', function(done) {
        chai.request('http://localhost:5000')
            .post('/auth/signup')
            .send({'email': 'testing@server.com', 'firstName': 'TESTING', 'lastName': 'SERVER', 'password': 'password'})
            .end(function(err, res) {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('success');
                res.body.success.should.be.a('boolean');
                res.body.should.have.property('message');
                res.body.message.should.be.a('string');
                done();
            });
    });
});