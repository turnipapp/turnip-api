var MongoClient = require('mongodb').MongoClient;
var ObjectID    = require('mongodb').ObjectID;
var config      = require('../config'); // get our config file
var nodemailer  = require('nodemailer');
var url         = process.env.MONGO_URL || config.database;
var addressValidator = require('address-validator');
var Address     = addressValidator.Address;
var _           = require('underscore');
var fs          = require('fs');
var geocoder    = require('geocoder');
var Async       = require('async');

function getPosts(events, userId, res) {
    MongoClient.connect(url, function(err, db) {
        var posts = db.collection('posts');
        var eventIds = [];

        for (var i = 0; i < events.length; i++) {
          eventIds[i] = events[i].id.toString();
        }

        posts.find({eventId: { $in: eventIds}}).toArray(function (err, docs) {
            var posts = [];
            var items = [];
            for (var i = 0; i < docs.length; i++) {
                if (docs[i].userId.toString() !== userId.toString()) {
                    posts.push(docs[i]);
                }
            }
            Async.each(posts, function(post, callback) {
                var item = {};
                // Gets name of event
                for (var j = 0; j < events.length; j++) {
                    if (events[j].id == post.eventId) {
                        item.eventTitle = events[j].name;
                        item.eventId = events[j].id;
                        break;
                    }
                }

                item.timestamp = post.timestamp;
                if (!post.isImage) {
                    item.preview = post.text.substr(0, 20) + "...";
                    item.isImage = false;
                } else {
                    item.isImage = true;
                }

                var users = db.collection('users');

                users.findOne({"_id": post.userId}, function(err, user) {
                    item.author = user.firstName + " " + user.lastName;
                    items.push(item);

                    callback();
                });

            }, function (err) {
                res.json({success: true, feed: items});
            });
        });
    });
}

var get = function(req, res) {
    MongoClient.connect(url, function(err, db) {
        var invites = db.collection('invites');
        invites.find({'userId': new ObjectID(req.decoded._id)}).toArray(function (err, docs) {
            var eventIds = [];
            for (var i = 0; i < docs.length; i++) eventIds.push(docs[i].eventId);
            var eventsCollection = db.collection('events');
            eventsCollection.find({"_id": { $in: eventIds}}).toArray(function (err, docs) {
                if(err) {
                    res.json({success: false, message: 'Events databse error'});
                    return;
                }
                var events = [];


                for (var i = 0; i < docs.length; i++) {
                  var event = {
                    id: docs[i]._id,
                    name: docs[i].title
                  };
                  events.push(event);
                }
                getPosts(events, req.decoded._id, res);
            });
        });
    });
};


var functions = {
  get: get
};

module.exports = functions;
