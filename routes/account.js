var MongoClient = require('mongodb').MongoClient;
var config      = require('../config'); // get our config file
var url         = process.env.MONGO_URL || config.database;
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