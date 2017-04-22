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

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.emailAddress,
    pass: config.emailPassword
  }
});


function verifyDate(start, end, res) {
    var date = new Date();
    var dateStart = new Date(start);
    var dateEnd = new Date(end);

    if (date.getTime() > dateStart.getTime() || dateEnd.getTime() < dateStart.getTime()) {
        res.json({success: false, message: 'Invalid date'});
        return false;
    } else {
        return {start: dateStart, end: dateEnd};
    }
}

// Creates Event
// POST /event
var create = function(req, res) {
    MongoClient.connect(url, function(err, db) {
        var users = db.collection('users');

        // date.start and date.end will hold the dates
        var date = verifyDate(req.body.dateStart, req.body.dateEnd, res);
        if (date === false) return;

        //Validates the address through Google Maps API
        //API found here: https://www.npmjs.com/package/address-validator   <-- not current API

        var geocode;

        var events = db.collection('events');
        var invitesColl = db.collection('invites');

        geocoder.geocode(req.body.location, function (results, status) {
            if (status.status != "OK") {
                res.json({success:false, message: "Invalid Location"});
                return;
            }

            var lat = status.results[0].geometry.location.lat;
            var lon = status.results[0].geometry.location.lon;

            var myEvent = {
                owner: new ObjectID(req.decoded._id),
                title: req.body.title,
                dateStart: date.start,
                dateEnd: date.end,
                location: status.results[0],
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
                    event: myEvent,
                    timestamp: new Date(),
                    eventId: myEvent._id
                };

                notifications.push(notification);

                var inviteObj = {
                    userId: new ObjectID(req.decoded._id),
                    eventId: result.ops[0]._id,
                    response: 'yes',
                    notifications: notifications
                };

                var invites = [];
                for (var i = 0; i < req.body.invites.length; i++) {
                    var obj = {
                        userId: new ObjectID(req.body.invites[i].id),
                        eventId: result.ops[0]._id,
                        response: 'pending',
                        username: req.body.invites[i].username,
                        notifications: notifications
                    };

                    //Updates the number of events a user has been invited to.
                    users.findOne({_id: new ObjectID(req.body.invites[i].id)}, function(err, user) {
                      if(err || !user) {
                        res.json({success: false, message: 'User database error'});
                        return;
                      } else {
                        if (isNaN(user.eventsInvited)) {
                          user.eventsInvited = 0;
                        }
                        var newEventsInvited = user.eventsInvited + 1;
                        users.update({_id: obj.userId}, {$set: {eventsInvited: newEventsInvited}});
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

                    sendInvites(invresult.ops, db);

                });
            });
          });

    });
};

function sendInvites(invites, db) {
  Async.each(invites, function(invite, callback) {
    if (invite == invites[invites.length - 1]) {
    } else {
      var users = db.collection('users');

      users.findOne({"_id": new ObjectID(invite.userId)}, function(err, user) {
        var email = user.email;
        var url = "http://localhost:3000/invite/" + invite._id;
        var message = "You've been invited to an event on Turnip!\n Follow the link to RSVP: " + url;
        var html = fs.readFileSync("./routes/emailTemplate.html", "utf8");
        html = html.replace("REPLACE_LINK_HERE", url);

        var mailOptions = {
          from: '"Turnip Events" <turnipinvites@gmail.com>',
          to: email,
          subject: "You've been invited to an event on Turnip!",
          text: message,
          html: html
        };
        transporter.sendMail(mailOptions);
      });
    }

  });
}

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
                res.json({message: 'Error finding updates'});
                return;
            }
            if (docs.length === 0) {
                res.json({message: 'No events found'});
            }

            var notifications = [];
            for (var i = 0; i < docs.length; i++) {
                notifications.push (docs[i].notification);
            }

            res.json({message: 'Retrieved Updates', notifications: notifications});
        });
    });
};
var info = function (req, res) {
    MongoClient.connect(url, function(err, db) {
        var invites = db.collection('invites');

        invites.find({eventId: new ObjectID(req.params.eventId)}).toArray(function (err, docs) {
            if (err) {
                return res.end ({success: false, message: "Error querying DB"});
            }
            var guests = [];
            var count = 0;
            for (var i = 0; i < docs.length; i++) {
               var guest = {
                    username: docs[i].userId,
                    response: docs[i].response
               };
               count++;
               guests.push(guest);
            }
            res.json({success: true, message: "Retrieved event info", guests: guests, count: count});
            return;
        });
    });
};


var functions = {
  response: response,
  create: create,
  past: past,
  upcoming: upcoming,
  notify: notify,
  info: info
};

module.exports = functions;
