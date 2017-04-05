var MongoClient = require('mongodb').MongoClient;
var ObjectID    = require('mongodb').ObjectID;
var config      = require('../config'); // get our config file
var nodemailer  = require('nodemailer');
var url         = process.env.MONGO_URL || config.database;

let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.emailAddress,
    pass: config.emailPassword
  }
});



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
            owner: new ObjectID(req.decoded._id),
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

            var notifications = [];
            var notification = {
                type: 1,
                seen: false,
                message: 'You have been invited to a new event!',
                timestamp: new Date()
            }
            notifications.push(notification);

            var inviteObj = {
                userId: new ObjectID(req.decoded._id),
                eventId: result.ops[0]._id,
                response: 'yes',
                notifications: notifications
            };

            console.log(req.body.invites);
            var invites = [];
            for (var i = 0; i < req.body.invites.length; i++) {
                var obj = {
                    userId: new ObjectID(req.body.invites[i].id),
                    eventId: result.ops[0]._id,
                    response: 'no',
                    notifications: notifications
                };

                //Updates the number of events a user has been invited to.
                users.findOne({_id: new ObjectID(req.body.invites[i].id)}, function(err, user) {
                  if(err) {
                    res.json({success: false, message: 'User database error'});
                  } else {
                    var newEventsInvited = user.eventsInvited + 1;
                    users.update({_id: new ObjectID(req.body.invites[i].id)}, {$set: {eventsInvited: newEventsInvited}});
                  }
                });
                invites.push(obj);
            }

            invites.push(inviteObj);

            invitesColl.insert(invites, function(err, invresult) {
                if(err) {
                    res.json({success: false, message: 'Invite database error'});
                }
                res.json({success: true, message: 'Event created Successfully', eventId: result.ops[0]._id});
                for(var i = 1; i < invresult.ops.length; i++) {
                  var url = "http://www.turnip.com/invite/" + invresult.ops[i]._id;
                  console.log(url);
                  var users = db.collection('users');

                  users.findOne({"_id": new ObjectID(invresult.ops[i].userId)}, function(err, user) {
                    var email = user.email;
                    var mailOptions = {
                      from: '"Turnip Events" <turnipinvites@gmail.com>',
                      to: email,
                      subject: "You've been invited to an event on Turnip!",
                      text: "You'be been invited to an event on Turnip!\n Follow the link to RSVP: " + url
                    }
                    transporter.sendMail(mailOptions, (error, info) => {
                      if (error) {
                        console.log(error);
                      } else {
                        console.log("message %s sent: %s", info.messageId, info.response);
                      }
                    });

                  });

                }
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

    users.findOne({_id: new ObjectID(req.decoded._id)}, function(err) {
      if (err) {
          res.json({success: false, message: 'Users database error'});
      }
      var invites = db.collection('invites');
      invites.findOne({eventID: req.body.eventID, userID: new ObjectID(req.decoded._id)}, function(err, invite) {
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
        invites.find({'userId': new ObjectID(req.decoded._id)}).toArray(function (err, docs) {
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
        invites.find({'userId': new ObjectID(req.decoded._id)}).toArray(function (err, docs) {
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
