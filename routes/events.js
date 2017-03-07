var MongoClient = require('mongodb').MongoClient;
var ObjectID    = require('mongodb').ObjectID;
var config      = require('../config'); // get our config file
var url         = process.env.MONGO_URL || config.database;

// Creates Event
// POST /event
var create = function(req, res) {
    MongoClient.connect(url, function(err, db) {
        var users = db.collection('users');

        var date = new Date();
        var dateStart = new Date(req.body.dateStart);
        var dateEnd = new Date(req.body.dateEnd);

        if (date.getTime() > dateStart.getTime() || dateEnd.getTime() < dateStart.getTime()) {
          res.json({success: false, message: 'Invalid date'});
          return;
        }

        var events = db.collection('events');
        var invitesColl = db.collection('invites');

        var myEvent = {
            owner: req.decoded._id,
            title: req.body.title,
            dateStart: req.body.dateStart,
            dateEnd: req.body.dateEnd,
            location: req.body.location,
            theme: req.body.theme
        };
        events.insert(myEvent, function(err, result) {
            if(err) {
                res.json({success: false, message: 'Events database error'});
            }

            var inviteObj = {
                userId: new ObjectID(req.decoded._id),
                eventId: result.ops[0]._id,
                response: 'yes'
            };

            var invites = [];
            for (var i = 0; i < req.body.invites.length; i++) {
                var obj = {
                    userId: new ObjectID(req.body.invites[i].id),
                    eventId: result.ops[0]._id,
                    response: 'no'
                };
                invites.push(obj);
            }

            invites.push(inviteObj);

            invitesColl.insert(invites, function(err, invresult) {
                if(err) {
                    res.json({success: false, message: 'Invite database error'});
                }
                res.json({success: true, message: 'Event created Successfully', eventId: result.ops[0]._id});
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
        var invites = db.collection('invites');
        invites.find({'userId': req.decoded._id}).toArray(function (err, docs) {
            var eventIds = [];
            for(var i = 0; i < docs.length; i++) {
              var obj = new ObjectID(docs[i].eventId);
              eventIds.unshift(obj);
            }

            var events = db.collection('events');

            events.find({"_id": { $in: eventIds}}).toArray(function (err, docs) {
                if(err) {
                    res.json({success: false, message: 'Events databse error'});
                    return;
                }
                var upcoming = [];
                var now = new Date();
                for(var i = 0; i < docs.length; i++) {
                    if(new Date(docs[i].dateStart) > now) {
                        upcoming.unshift(docs[i]);
                    }
                }
                res.json({success:true, upcoming: upcoming});
            });
        });
    });
};

var past = function(req, res) {
    MongoClient.connect(url, function(err, db) {
        var invites = db.collection('invites');
        invites.find({'userId': req.decoded._id}).toArray(function (err, docs) {
            var eventIds = [];
            for(var i = 0; i < docs.length; i++) {
              var obj = new ObjectID(docs[i].eventId);
              eventIds.unshift(obj);
            }

            var events = db.collection('events');

            events.find({"_id": { $in: eventIds}}).toArray(function (err, docs) {
                if(err) {
                    res.json({success: false, message: 'Events databse error'});
                    return;
                }
                var past = [];
                var now = new Date();
                for(var i = 0; i < docs.length; i++) {
                    if(new Date(docs[i].dateStart) < now) {
                        past.unshift(docs[i]);
                    }
                }
                res.json({success:true, past: past});
            });
        });
    });
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
  past: past,
  upcoming: upcoming,
  notify: notify
};

module.exports = functions;
