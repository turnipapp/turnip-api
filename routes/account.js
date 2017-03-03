var MongoClient = require('mongodb').MongoClient;
var ObjectID    = require('mongodb').ObjectID;
var config      = require('../config'); // get our config file
var url         = process.env.MONGO_URL || config.database;
var bcrypt      = require('bcrypt');
var saltRounds  = 10;


// Expects token
// GET /account
var getAccount = function(req, res) {
    MongoClient.connect(url, function(err, db) {
        var users = db.collection('users');

        var userId = req.decoded._id;
        users.findOne({"_id": new ObjectID(userId)}, function(err, document){
            res.json({success: true, firstName: document.firstName, lastName: document.lastName, email: document.email});
        });
    });
};

// Expects token, firstName, lastName, email, password, new password
exports.update = function(req, res) {
    MongoClient.connect(url, function(err, db) {
        var users = db.collection('users');

        var userId = req.decoded._id;
        users.findOne({"_id": new ObjectID(userId)}, function(err, user) {
            bcrypt.compare(req.body.password, user.password, function(err, match) {
                if(!match){
                    res.json({success: false, message: 'Password incorrect'});
                } else {

                    if('newPassword' in req.body){
                        updateWithPassword(req.body, db, res, userId);
                    } else {
                        updateWithoutPassword(req.body, db, res, userId);
                    }
                }
            });
        });
    });
}

function updateWithPassword(body, db, res, userId){
    var users = db.collection('users');

    encrypt(body.newPassword, function(err, hash) {
        users.update({"_id": new ObjectID(userId)}, {
            email: body.email,
            firstName: body.firstName,
            lastName: body.lastName,
            password: hash
        }, function(err, result) {
            if(err) {
                res.json({success: false, message: 'Database error'});
            }

            res.json({success: true, message: 'Successfully updated account info.'});
        });
    });
}

function updateWithoutPassword(body, db, res, userId){
    var users = db.collection('users');

    users.update({"_id": new ObjectID(userId)}, {$set: {
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName
    }}, function(err, result) {
        if(err) {
                res.json({success: false, message: 'Database error'});
            }

            res.json({success: true, message: 'Successfully updated account info.'});
    });
}

function encrypt(password, callback) {
    bcrypt.hash(password, saltRounds, function(err, hash) {
        callback(err, hash);
    });
}

var functions = {
    getAccount: getAccount
};

module.exports = functions;
