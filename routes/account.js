var MongoClient = require('mongodb').MongoClient;
var config      = require('../config'); // get our config file
var url         = process.env.MONGO_URL || config.database;
var crypto      = require('crypto');
var bcrypt      = require('bcrypt');
var saltRounds  = 10;
var valid_token = require('./valid_token');

// Expects token
exports.getAccountInfo = function(req, res) {
    MongoClient.connect(url, function(err, db) {
        var colleciton = db.collection('users');

        var userId = req.decoded._id;
        colleciton.find(ObjectId(userId)).toArray(function(err, document){
            res.json({firstName: document.firstName, lastName: document.lastName, email: document.email});
        });
    });
}

// Expects token, firstName, lastName, email, password, new password
exports.update = function(req, res) {
    MongoClient.connect(url, function(err, db) {
        var colleciton = db.collection('users');

        var userId = req.decoded._id;
        
    });
}

function encrypt(password, callback) {
    bcrypt.hash(password, saltRounds, function(err, hash) {
        callback(err, hash);
    });
}