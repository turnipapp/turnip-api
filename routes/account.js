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
        colleciton.findOne(ObjectId(userId), function(err, user){
            res.json({firstName: user.firstName, lastName: user.lastName, email: user.email});
        });
    });
}

// Expects token, firstName, lastName, email, password, new password
exports.update = function(req, res) {
    MongoClient.connect(url, function(err, db) {
        var colleciton = db.collection('users');

        var userId = req.decoded._id;
        collection.findOne(ObjectId(userId), function(err, user) {
            bcrypt.compare(req.body.password, user.password, function(err, match) {
                if(!match) {
                    res.json({success: false, message: 'Incorrect password'})
                }
            });
        });
    });
}

function encrypt(password, callback) {
    bcrypt.hash(password, saltRounds, function(err, hash) {
        callback(err, hash);
    });
}