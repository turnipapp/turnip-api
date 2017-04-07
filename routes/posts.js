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
            if (sorted.length > 0) {
              for(var i = 0; i < sorted.length; i++) {
                posts.find({parentId: sorted[i]._id}).toArray(function(err, comments) {
                  if (comments) {
                    sorted[i].comments = comments;
                  }
                });
              }
            }

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
            eventId: req.body.eventId,
            timestamp: new Date(),
            parentId: req.body.parentId
        };

        /*
          Notifies all invited users (given their preferences) of new post
        */
        var message = 'A user has posted in the event: ' + req.body.id;
        var notification = {
            type: 4,
            seen: false,
            message: message,
            timestamp: new Date()
        }
        var invites = db.collection('invites');
        invites.update({"eventId": req.body.id}, { $push: {notifications: notification}});

        /*
        invites.find({"eventId": {$in : req.body.id}}).toArray( function (err, docs) {
            if (err) {
              res.json({success: false, message: 'Error updating user notifications'});
              return;
            }

            var message = 'A user has posted in the event: ' + req.body.id;

            var notification = {
                type: 4,
                seen: false,
                message: message,
                timestamp: new Date.now()
            }

            for (var i = 0; i < docs.length; i++) {
                docs[i].notifications.push(obj)
            }
        });
        */
        posts.insert(postObj, function(err, result) {
            res.json({success: true});
        });
    });
};

var edit = function(req, res) {
    MongoClient.connect(url, function(err, db) {
        var posts = db.collection('posts');

        posts.update({"_id": new ObjectID(req.body.postID)}, {$set: {
            text: req.body.text
        }}, function(err, result) {
            if(err) {
                res.json({success: false, message: 'Database error.'});
            }

            res.json({success: true, message: 'Successfully edited post.'});

        });
    });
};

var delete_post = function(req, res) {
    MongoClient.connect(url, function(err, db) {
        var posts = db.collection('posts');

        posts.remove({_id: ObjectID(req.body.postID)}, function(err, result) {
            if(err) {
                res.json({success: false, message: 'Database error.'});
            }

            res.json({success: true, message: 'Successfully deleted post.'});
        });
    });
};

var functions = {
    getAll: getAll,
    create: create,
    edit: edit,
    delete: delete_post
};

function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

module.exports = functions;
