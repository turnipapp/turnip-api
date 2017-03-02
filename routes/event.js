var MongoClient = require('mongodb').MongoClient;
var ObjectID    = require('mongodb').ObjectID;
var config      = require('../config'); // get our config file
var url         = process.env.MONGO_URL || config.database;

var getOne = function(req, res) {
    MongoClient.connect(url, function(err, db) {
        var events = db.collection('events');

        events.findOne({"_id": new ObjectID(req.params.id)}, function(err, e) {
            if(err) {
                res.json({success: false, message: 'Database error'});
            }

            res.json({success: true, event: e});
        });
    });
};

var functions = {
    getOne: getOne
};

module.exports = functions;
