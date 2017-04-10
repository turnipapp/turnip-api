var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../app');
var should = chai.should();
var supertest = require('supertest');
var server = supertest.agent('http://localhost:5000');

/**
 * This is where you write your tests. Make sure you follow the structure of the 'Register User' test. 
 * This website helped me writing these tests: https://codeforgeek.com/2015/07/unit-testing-nodejs-application-using-mocha/
 * If you want to clean your collection go to setup.js and do it there
 * 
 * To run all test go to the /turnip-api/ folder and run 'mocha'
 * 
 * Having trouble? Google mocha supertest + your question
 */



describe('Register User', function() {
    var token;
    var userId;
    
    it('should add user TESTING SERVER to the user database on /auth/signup POST', function(done) {
        server
        .post('/auth/signup')
        .send({email: 'testing@server.com', firstName: 'TESTING', lastName: 'SERVER', password: 'password'})
        .expect('Content-type', /json/)
        .expect(200)
        .end(function(err, res) {
            res.status.should.equal(200);
            res.body.success.should.equal(true);
            done();
        });
    });

    it('should not log user in because of a wrong password on /auth/login POST', function(done) {
        server
        .post('/auth/login')
        .send({email: 'testing@server.com', password: 'notcorrect'})
        .expect('Content-type', /json/)
        .expect(200)
        .end(function(err, res) {
            res.status.should.equal(200);
            res.body.success.should.equal(false);
            done();
        });
    });

    it('should not log user in because of a wrong email on /auth/login POST', function(done) {
        server
        .post('/auth/login')
        .send({email: 'noemail', password: 'password'})
        .expect('Content-type', /json/)
        .expect(200)
        .end(function(err, res) {
            res.status.should.equal(200);
            res.body.success.should.equal(false);
            done();
        });
    })

    it('should log user TESTING SERVER in and return success: true and a token on /auth/login POST', function(done) {
        server
        .post('/auth/login')
        .send({email: 'testing@server.com', password: 'password'})
        .expect('Content-type', /json/)
        .expect(200)
        .end(function(err, res) {
            res.status.should.equal(200);
            res.body.success.should.equal(true);
            res.body.should.have.property('token');
            token = res.body.token;
            done();
        });
    });

    it('should return users account info on /account GET', function(done) {
        server
        .get('/account')
        .expect('Content-type', /json/)
        .set('token', token)
        .expect(200)
        .end(function(err, res) {
            res.status.should.equal(200);
            res.body.success.should.equal(true);
            res.body.firstName.should.equal('TESTING');
            res.body.lastName.should.equal('SERVER');
            res.body.email.should.equal('testing@server.com');
            res.body.should.have.property('id');
            userId = res.body.id;
            done();
        });
    });

    it('should update the password, email, firstName, and lastName of the account on /account/update PUT', function(done) {
        server
        .put('/account/update')
        .set('token', token)
        .send({email: 'newemail@gmail.com', firstName: 'FIRSTNAME', lastName: 'LASTNAME', password: 'password', newPassword: '123456'})
        .expect('Content-type', /json/)       
        .expect(200)
        .end(function(err, res) {
            res.status.should.equal(200);
            res.body.success.should.equal(true);
            done();
        });
    });

    it('should return the new account info on /account GET', function(done) {
        server
        .get('/account')
        .expect('Content-type', /json/)
        .set('token', token)
        .expect(200)
        .end(function(err, res) {
            res.status.should.equal(200);
            res.body.success.should.equal(true);
            res.body.firstName.should.equal('FIRSTNAME');
            res.body.lastName.should.equal('LASTNAME');
            res.body.email.should.equal('newemail@gmail.com');
            res.body.should.have.property('id');
            done();
        });
    });

    it('should fail to update account info because wrong password given on /account/update PUT', function(done) {
        server
        .put('/account/update')
        .send({email: 'newemail@gmail.com', firstName: 'FIRSTNAME', lastName: 'LASTNAME', password: 'notcorrect'})
        .expect('Content-type', /json/)
        .set('token', token)
        .expect(200)
        .end(function(err, res) {
            res.status.should.equal(200);
            res.body.success.should.equal(false);
            done();
        });
    });
});

