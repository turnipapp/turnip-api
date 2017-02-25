var MongoClient = require('mongodb').MongoClient;
var config      = require('../config'); // get our config file
var url         = process.env.MONGO_URL || config.database;

exports.create = function(req, res) {
    MongoClient.connect(url, function(err, db) {
        var collection = db.collection('events');

        var myEvent = {
            token = req.body.token,
            title = req.body.title,
            dateStart = req.body.dateStart,
            dateEnd = req.body.dateEnd,
            location = req.body.location
        };
        collection.insert(myEvent, function(err, result) {
            if(err) {
                res.json({success: false, message: 'Database error'});
            }
            res.json({success: true, message: 'Successfully added event.'});
        });

    });
};
