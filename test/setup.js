var MongoClient = require('mongodb').MongoClient;
var config      = require('../config'); // get our config file
var url         = process.env.MONGO_URL || config.database;

/* This test run before any other test */
describe("Setup", function() {
    
    /* DELETES 'users' COLLECTION */
    /*
    it("Cleaning user collection...", function() {
        MongoClient.connect(url, function(err, db) {
            db.collection('users', function(err, collection) {
                collection.remove();
            });
        });
    });
    */


});
