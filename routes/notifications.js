var MongoClient = require('mongodb').MongoClient;
var ObjectID    = require('mongodb').ObjectID;
var config      = require('../config'); // get our config file
var url         = process.env.MONGO_URL || config.database;

var get = function (req, res) {
    MongoClient.connect(url, function(err, db) {
        /*
          Retrieves users notification settings
        */
        var users  = db.collection('users');
        /*
          Filters and returns notifications
        */
        var filtered = [];
        var count = 0;
        var invites = db.collection('invites');
            
        
        invites.find({userId: new ObjectID(req.decoded._id)}).toArray( function (err, docs) {
            if (err) {
                res.json({success: false, message: "Error querying database! :("});
                return;
            }
            for (var i = 0; i < docs.length; i++) {
                filtered.push(docs[i].notifications);
                count++;
            }
            invites.update([{userId: new ObjectID(req.decoded._id)}, {$set: {'notifications.seen': true}}])

            res.json({success: true, message: "Retrieved notifications", notifications: filtered, count: count});
        });
    

    })
}

var functions = {
    get: get
}

module.exports = functions;
