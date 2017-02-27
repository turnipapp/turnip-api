var MongoClient = require('mongodb').MongoClient;
var config      = require('../config'); // get our config file
var url         = process.env.MONGO_URL || config.database;
var valid_token = require('./valid_token');

exports.create = function(req, res) {
    MongoClient.connect(url, function(err, db) {
        var events = db.collection('events');
        var users = db.collection('users');
        var connections = db.collection('connections');
        users.find({_id: req.decoded._id}).toArray(function(err, docs){
          if (err) {
              res.json({success: false, message: 'Users database error'});
          }

          if(docs.length === 0) {
                res.json({success: false, message: 'No matching user found'});
            } else {
                var myEvent = {
                    title: req.body.title,
                    dateStart: req.body.dateStart,
                    dateEnd: req.body.dateEnd,
                    location: req.body.location
                };
                events.insert(myEvent, function(err, result) {
                    if(err) {
                        res.json({success: false, message: 'Events database error'});
                    }
                    connections.insert({userId: req.decoded._id, eventId: result.id}, function(newErr, newResult) {
                      if (newErr) {
                        res.json({success: false, message: 'Connections database error'});
                      }
                      res.json({success: true, message: 'Event created Successfully'});
                    });
                });


            }
        });
    });
};

exports.upcoming = function(req, res) {
    MongoClient.connect(url, function(err, db) {
        var collection = db.collection('events');

        collection.find({email: req.body.email}).toArray(function(err, docs){
            if(docs.length === 0) {
                res.json({success: false, message: 'No email'});
            } else {
                var user = docs[0];
                bcrypt.compare(req.body.password, user.password, function(err, match) {
                    if(!match) {
                        res.json({success: false, message: 'Incorrect passwword'});
                    } else {
                        var inToken = {
                            _id: user._id,
                            iat: user.iat,
                            exp: user.exp
                        };
                        var token = jwt.sign(inToken, config.secret, {
                            expiresIn: 86400 // expires in 24 hours
                        });
                        res.json({
        					success: true,
                            token: token,
                            message: ''
        				});
                    }
                });
            }
        });
    });
};

/*
exports.response = function(req, res) {
    MongoClient.connect(url, function (err, db) {
        var collection = db.collection('events');
        
        var inToken = {
            _id: user._id,
            iat: user.iat,
            exp: user.exp
        }

        
    }
};
*/
