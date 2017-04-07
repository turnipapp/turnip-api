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
            eventId: req.body.eventId,
            timestamp: new Date()
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

/**
 * Allows user to edit post
 * req = {text: string}
 */
var edit = function(req, res) {
    MongoClient.connect(url, function(err, db) {
        var posts = db.collection('posts');
        var events = db.collection('events');

        posts.update({"_id": new ObjectID(req.params.post_id)}, {$set: {
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

        var userId = new ObjectID(req.decoded._id);
        var post = posts.findOne({'_id': new ObjectID(req.params.post_id)});
        var postCreatorId = new ObjectID(post.userId);

        var event = events.findOne({'_id': new ObjectID(post.eventId)});
        var hostId = new ObjectID(event.owner);

        if(!(userId.equals(hostId) || userId.equals(postCreatorId))) {
            res.json({success: false, message: 'User does not have permission to edit post'});
            return;
        }

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
