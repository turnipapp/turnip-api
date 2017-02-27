var MongoClient = require('mongodb').MongoClient;
var ObjectID    = require('mongodb').ObjectID;
var config      = require('../config'); // get our config file
var url         = process.env.MONGO_URL || config.database;
var valid_token = require('./valid_token');

exports.create = function(req, res) {
    MongoClient.connect(url, function(err, db) {
        var users = db.collection('users');
        users.findOne({_id: new ObjectID(req.decoded._id)}, function(err){
          if (err) {
              res.json({success: false, message: 'Users database error'});
          }
          var events = db.collection('events');
          var myEvent = {
              owner: req.decoded._id,
              title: req.body.title,
              dateStart: req.body.dateStart,
              dateEnd: req.body.dateEnd,
              location: req.body.location
          };
          events.insert(myEvent, function(err, result) {
              if(err) {
                  res.json({success: false, message: 'Events database error'});
              }
              res.json({success: true, message: 'Event created Successfully'});
          });
        });
    });
};

exports.response = function(req, res) {
  MongoClient.connect(url, function(err, db) {
    var users = db.collection('users');
    users.findOne({_id: req.decoded._id}, function(err) {
      if (err) {
          res.json({success: false, message: 'Users database error'});
      }
      var invites = db.collection('invites');
      invites.findOne({eventID: req.body.eventID, userID: req.decoded._id}, function(err, invite) {
        if (err) {
          res.json({success: false, message: 'Invites database error'});
        }
        invite.response = req.body.response;
        res.json({success: true, message: 'Response updated successfully'});
      });
    });
  });
}




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
}
