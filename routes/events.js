var MongoClient = require('mongodb').MongoClient;
var ObjectID    = require('mongodb').ObjectID;
var config      = require('../config'); // get our config file
var url         = process.env.MONGO_URL || config.database;


// Creates Event
// POST /event
var create = function(req, res) {
    MongoClient.connect(url, function(err, db) {
        var users = db.collection('users');
        users.findOne({_id: new ObjectID(req.decoded._id)}, function(err, user){
          if (err) {
              res.json({success: false, message: 'Users database error'});
          }
          if (!user) {
              res.json({success: false, message: 'No user found'});
          }
          //TODO: Validate request information format
          var events = db.collection('events');
          var myEvent = {
              owner: req.decoded._id,
              title: req.body.title,
              dateStart: req.body.dateStart,
              dateEnd: req.body.dateEnd,
              location: req.body.location,
              theme: req.body.theme,
              userId: user._id
          };
          events.insert(myEvent, function(err, result) {
              if(err) {
                  res.json({success: false, message: 'Events database error'});
              }
              var invites = db.collection('invites');
              // Insert req.body.invites array as separate entries
              res.json({success: true, message: 'Event created Successfully', eventId: result.ops[0]._id, sex: true});
          });
        });
    });
};

/************************************
 *
 *          RESPONSE
 *
*************************************/
var response = function(req, res) {
  MongoClient.connect(url, function(err, db) {
    var users = db.collection('users');

    if (req.body.response != "no" && req.body.response != "yes" && req.body.response != "maybe") {

        res.json({success: false, message: 'Invalid response'});
        return;
    }

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
};

/************************************
 *
 *          UPCOMING
 *
*************************************/
var upcoming = function(req, res) {
    MongoClient.connect(url, function(err, db) {

        var collection = db.collection('events');
        collection.find({email: req.decoded.email}).toArray(function(err, docs){
            if (err) {
                res.json({success: false, message: 'Error while querying database'});
                return;
            }
            if(docs.length === 0) {
                res.json({success: false, message: 'No events found'});
                return;
            }

            var upcoming = [];
            var past = [];
            var errmessage = '';

            for (var i = 0; i < docs.length; i++) {
                var dateEnd = new Date(docs[i].dateEnd);
                var now = new Date();

                if (now.getTime() < dateEnd.getTime()) {
                    upcoming.push (docs[i]);
                } else {
                    past.push (docs[i]);
                }
            }

            res.json({success: true, message: 'Retrieved Events' + errmessage, upcoming, past})           
        })
    })
}

var past = function(req, res) {
    MongoClient.connect(url, function(err, db) {

        var collection = db.collection('events');
        collection.find({email: req.decoded.email}).toArray(function(err, docs){
            if (err) {
                res.json({success: false, message: 'Error while querying database'});
                return;
            }
            if(docs.length === 0) {
                res.json({success: false, message: 'No events found'});
                return;
            }

            var upcoming = [];
            var past = [];
            var errmessage = '';

            for (var i = 0; i < docs.length; i++) {
                var dateEnd = new Date(docs[i].dateEnd);
                var now = new Date();

                if (now.getTime() < dateEnd.getTime()) {
                    upcoming.push (docs[i]);
                } else {
                    past.push (docs[i]);
                }
            }

            res.json({success: true, message: 'Retrieved Events' + errmessage, upcoming, past})           
        })
    })

};


//GET events/notify
var notify = function (req, res) {
    MongoClient.connect(url, function(err, db) {
        var invites = db.collection('invites');
        invites.find({update: true}, function (err, docs) {
            if (err) {
                res.json({message: 'Error finding updates'})
                return;
            }
            if (docs.length === 0) {
                res.json({message: 'No events found'})
            }

            var notifications = [];
            for (var i = 0; i < docs.length; i++) {
                notifications.push (docs[i].notification);
            }

            res.json({message: 'Retrieved Updates', notifications});
        })
    }) 
}

var functions = {
  response: response,
  create: create,
  past: upcoming,
  upcoming: upcoming,
  notify: notify
};

module.exports = functions;
