var router = require('express').Router();
var Users = require('../models/user.js');
var bcrypt = require('bcrypt');
var mongoose = require('mongoose');
var saltRounds = 10;

router.post('/login', function(req, res) {
    Users.findOne({email: req.body.email}, function(err, user) {
        if(err) res.json({status: 500});
        if(user) {
          bcrypt.compare(req.body.password, user.password, function(err, isVerified) {
            if (isVerified) {
              res.json({status: 200, message: '', user: user});
            } else {
                res.json({token: '', status: 420, message: 'Email/password combination incorrect'});
            }
          });
        } else {
            res.json({token: '', status: 420, message: 'User not found'});
          }
    });
}

router.post('/signup', function(req, res) {
    Users.findOne({email: req.body.email}, function(err, user) {
        if(err) res.json({status: 500});
        if(user) {
            res.json({token: '', status: 421, message: 'Email already exists'});
        } else {
            encrypt(req.body.password, function(err, hash){
              var userData = {
                  firstName: req.body.firstName,
                  lastName: req.body.lastName,
                  email: req.body.email,
                  password: hash
              };
              Users.create(userData);
              res.json({status: 200});
            });
        }
    });
});

function encrypt(password, callback) {
  bcrypt.hash(password, saltRounds, function(err, hash) {
    callback(err, hash);
  });
}
