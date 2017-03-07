var MongoClient = require('mongodb').MongoClient;
var ObjectID    = require('mongodb').ObjectID;
var config      = require('../config'); // get our config file
var url         = process.env.MONGO_URL || config.database;

var getAll = function(req, res) {
    MongoClient.connect(url, function(err, db) {
        var posts = db.collection('posts');

        posts.find({eventId: req.params.id}).toArray(function(err, docs) {
            var sorted = sortByKey(docs, "timestamp");
            sorted.reverse();
            res.json({success: true, posts: sorted});
        });

        // events.findOne({"_id": new ObjectID(req.params.id)}, function(err, e) {
        //     if(err) {
        //         res.json({success: false, message: 'Database error'});
        //     }
        //
        //     res.json({success: true, event: e});
        // });
    });
};
var create = function(req, res) {
    MongoClient.connect(url, function(err, db) {
        var posts = db.collection('posts');

        var postObj = {
            text: req.body.text,
            userId: new ObjectID(req.decoded._id),
            eventId: req.params.id,
            timestamp: new Date()
        };

        posts.insert(postObj, function(err, result) {
            res.json({success: true});
        });
    });
};

var functions = {
    getAll: getAll,
    create: create
};

function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

module.exports = functions;
