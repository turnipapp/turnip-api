var MongoClient = require('mongodb').MongoClient;
var config      = require('../config'); // get our config file
var url         = process.env.MONGO_URL || config.database;
var crypto      = require('crypto');
var bcrypt      = require('bcrypt');
var saltRounds  = 10;
var jwt         = require('jsonwebtoken'); // used to create, sign, and verify tokens

// Expects email and password
exports.login = function(req, res) {
    MongoClient.connect(url, function(err, db) {
        var collection = db.collection('users');

        collection.find({email: req.body.email}).toArray(function(err, docs){
            if(docs.length === 0) {
                res.json({success: false, message: 'No email'});
            } else {
                var user = docs[0];
                bcrypt.compare(req.body.password, user.password, function(err, match) {
                    if(!match) {
                        res.json({success: false, message: 'Incorrect passwword'});
                    } else {
                        var inToken = {
                            _id: user._id,
                            iat: user.iat,
                            exp: user.exp
                        };
                        var token = jwt.sign(inToken, config.secret, {
                            expiresIn: 86400 // expires in 24 hours
                        });
                        res.json({
        					success: true,
                            token: token,
                            message: ''
        				});
                    }
                });
            }
        });
    });
};

// Expects email, password, app name
exports.signup = function(req, res) {
    MongoClient.connect(url, function(err, db) {
        var collection = db.collection('users');

        collection.find({email: req.body.email}).toArray(function(err, docs){
            // TODO: Add Check that contents exist
            if(docs.length === 0) {
                allowSignup(req.body, db, res);
            } else {
                res.json({success: false, message: 'That email already exists'});
            }
        });
    });
};

// Expects token
exports.account = function(req, res) {
    MongoClient.connect(url, function(err, db) {
        var colleciton = db.collection('users');

        var userId = req.decoded._id;
        var userInfo = colleciton.find(ObjectId(userId)).toArray(function(err, document){
            res.json({firstName: document.firstName, lastName: document.lastName, email: document.email});
        });

    });
}

function allowSignup(body, db, res) {
    var collection = db.collection('users');
    encrypt(body.password, function(err, hash) {
        var user = {
            email: body.email,
            firstName: body.firstName,
            lastName: body.lastName,
            password: hash
        };
        collection.insert(user, function(err, result) {
            if(err) {
                res.json({success: false, message: 'Database error'});
            }
            res.json({success: true, message: 'Successfully registered. Redirecting...'});
        });
    });
}

function encrypt(password, callback) {
    bcrypt.hash(password, saltRounds, function(err, hash) {
        callback(err, hash);
    });
}

function getToken(len) {
    return crypto.randomBytes(len).toString('hex');
}