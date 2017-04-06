var MongoClient = require('mongodb').MongoClient;
var config      = require('../config'); // get our config file
var url         = process.env.MONGO_URL || config.database;

describe("Setup", function() {
    it("Cleaning user database", function() {
        MongoClient.connect(url, function(err, db) {
            db.collection('users', function(err, collection) {
                collection.remove();
            });
        });
    });
});