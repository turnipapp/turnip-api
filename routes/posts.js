var MongoClient = require('mongodb').MongoClient;
var ObjectID    = require('mongodb').ObjectID;
var config      = require('../config'); // get our config file
var url         = process.env.MONGO_URL || config.database;
var Async       = require('async');

var getAll = function(req, res) {
    MongoClient.connect(url, function(err, db) {
        var posts = db.collection('posts');
        var users = db.collection('users');

        posts.find({eventId: req.params.id}).toArray(function(err, docs) {
            var sorted = sortByKey(docs, "timestamp");
            sorted.reverse();
            if (docs.length > 0) {
                Async.each(sorted, function(post, callback){
                    if (post.likers) {
                        post.likes = post.likers.length;
                    }
                    post.likers = [];
                    users.findOne({"_id": new ObjectID(post.userId)}, function(err, user) {
                      if (!user) {
                        res.json({success: false, message: 'no user found'});
                      } else {
                        post.name = user.firstName + " " + user.lastName;
                      }
                      callback();
                    });

                }, function(err) {
                    res.json({success: true, posts: sorted});
                });
            } else {
                res.json({success: true, posts: []});
            }
        });
    });
};

var getMemories = function(req, res) {
    MongoClient.connect(url, function(err, db) {
        var posts = db.collection('posts');
        var users = db.collection('users');

        posts.find({eventId: req.params.id}).toArray(function(err, docs) {
            var sorted = sortByKey(docs, "score");
            sorted.reverse();
            if (docs.length > 0) {
                Async.each(sorted, function(post, callback){
                    if (post.likers) {
                        post.likes = post.likers.length;
                    }
                    post.likers = [];
                    users.findOne({"_id": new ObjectID(post.userId)}, function(err, user) {
                      if (!user) {
                        res.json({success: false, message: 'no user found'});
                      } else {
                        post.name = user.firstName + " " + user.lastName;
                      }
                      callback();
                    });

                }, function(err) {
                    res.json({success: true, posts: sorted});
                });
            } else {
                res.json({success: true, posts: []});
            }
        });
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
            comments: [],
            isImage: false,
            likes: 0,
            likers: [],
            score: 0
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
        };
        var invites = db.collection('invites');
        invites.update({"eventId": req.body.id}, { $push: {notifications: notification}});


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
        var breakFunction = false;

        posts.findOne({'_id': new ObjectID(req.params.post_id)}, function(err, post) {
            if(err) {
                res.json({success: false, message: "Database error"});
                breakFunction = true;
                return;
            }

            var userId = new ObjectID(req.decoded._id);
            var postCreatorId = new ObjectID(post.userId);

            if(!(userId.equals(postCreatorId))) {
                res.json({success: false, message: 'User does not have permission to edit post'});
                breakFunction = true;
            }
        });

        if(breakFunction){
            return;
        }

        posts.update({"_id": new ObjectID(req.params.post_id)}, {$set: {
            text: req.body.text
        }}, function(err, result) {
            if(err) {
                res.json({success: false, message: 'Database error.'});
                return;
            }

            res.json({success: true, message: 'Successfully edited post.'});

        });
    });
};

var delete_post = function(req, res) {
    MongoClient.connect(url, function(err, db) {
        var posts = db.collection('posts');
        var events = db.collection('events');
        var breakFunction = false;

        posts.findOne({'_id': new ObjectID(req.params.post_id)}, function(err, post) {
            if(err) {
                res.json({success: false, message: "Database error"});
                breakFunction = true;
                return;
            }

            if(breakFunction){
                return;
            }

            events.findOne({'_id': new ObjectID(post.eventId)}, function(err, event) {
                if(err){
                    res.json({success: false, message: "Database error"});
                    return;
                }
                var userId = new ObjectID(req.decoded._id);
                var hostId = new ObjectID(event.owner);
                var postCreatorId = new ObjectID(post.userId);

                if(!(userId.equals(hostId) || userId.equals(postCreatorId))){
                    res.json({success: false, message: "User does not have permission to delete post"});
                    return;
                }

                posts.remove({_id: new ObjectID(req.params.post_id)}, function(err, result) {
                    if(err) {
                        res.json({success: false, message: 'Database error.'});
                    }

                    res.json({success: true, message: 'Successfully deleted post.'});
                });
            });
        });
    });
};

var addComment = function(req, res) {
    MongoClient.connect(url, function(err, db) {
        var posts = db.collection('posts');
        var score;
        var comment = {
            author: req.decoded._id,
            body: req.body.comment,
            visible: true,
            timestamp: new Date()
        };


        posts.findOne({"_id": new ObjectID(req.params.id)}, function(err, doc) {
            if(doc) {
                score = Math.ceil(Math.sqrt(doc.likers.length)) + doc.comments.length;
                posts.update({"_id": new ObjectID(req.params.id)}, { $set: {score: score}}, function (err, update) {

                });
                posts.update({"_id": new ObjectID(req.params.id)}, { $push: {comments: comment}}, function (err, update) {
                    res.json({success: true});
                });
            }
        });
    });
};

var like = function(req, res) {
    MongoClient.connect(url, function(err, db) {
        var posts = db.collection('posts');
        var score;
        var likeObj = {
            userId: req.decoded._id,
            timestamp: new Date()
        };

        posts.update({"_id": new ObjectID(req.params.id)}, { $push: {likers: likeObj } }, function (err, update) {
            if (err) {
                res.json({success: false});
            }

            posts.findOne({"_id": new ObjectID(req.params.id)}, function (err, doc) {
                if (err) {
                    res.json({success: false});
                } else{
                  score = Math.ceil(Math.sqrt(doc.likers.length)) + doc.comments.length;
                  posts.update({"_id": new ObjectID(req.params.id)}, { $set: {score: score}}, function (err, update) {

                  });
                  res.json({success: true, likes: doc.likers.length});
                }

            });
        });
    });
};

var functions = {
    getAll: getAll,
    create: create,
    edit: edit,
    delete: delete_post,
    addComment: addComment,
    like: like,
    getMemories: getMemories
};

function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

module.exports = functions;
