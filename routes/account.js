var MongoClient = require('mongodb').MongoClient;
var ObjectID    = require('mongodb').ObjectID;
var config      = require('../config'); // get our config file
var url         = process.env.MONGO_URL || config.database;

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

var functions = {
    getAccount: getAccount
};

module.exports = functions;
