var MongoClient = require('mongodb').MongoClient;
var ObjectID    = require('mongodb').ObjectID;
var config      = require('../config'); // get our config file
var url         = process.env.MONGO_URL || config.database;

/************************************
 *
 *             INVITE
 *
*************************************/
var inviteUser = function (req, res) {
    MongoClient.connect(url, function (err, db) {
        if (err) {
            res.json({success: false, message: 'Error inviting user'});
        }
        if (!req.body.eventID || !req.decoded._id || ! req.body.userID) {
            res.json({success: false, message: 'Error inviting user: NE Info'});
            return;
        }
        var events = db.collection('events');
        var users = db.collection('users');
        var invites = db.collection('invites');


        events.findOne({_id: new ObjectID(req.body.eventID), owner: req.decoded._id }, function (err)  {
            if (err) {
                res.json({success: false, message: 'Error retrieving event'});
                return;
            }

            //TODO: Allow for inviting an array of users
            //TODO: Allow for inviting users via username/phonenumber/etc
            //TODO: Add more info to objects in invites?
            //TODO: Add notification functionality
            users.findOne({email: req.body.email}, function (err, doc) {
                if (!doc) {
                    res.json({success: false, message: "No user found with that email"});
                    return;
                }

                /*
                  Creates invite notification for invited users
                */
                var notifications = [];
                var notification = {
                    type: 1,
                    seen: false,
                    message: 'You have been invited to a new event!',
                    timestamp: new Date.now(),
                    eventId: req.body.eventID
                };
                notifications.push(notification);

                var invite = {
                    owner: req.decoded._id,
                    eventID: req.body.eventID,
                    userID: doc._id,
                    email: doc._email,
                    response: "no",
                    update: true,
                    notifications: notifications
                };

                var invited = invites.find({eventID: req.body.eventID, userID: doc._id});
                if (!invited) {
                    invites.insert(invite, function (err, result) {
                        if (err) {
                            res.json({success: false, message: "Invites insert error"});
                            return;
                        }
                        res.json({success: true, message: "User invited successfully"});
                        return;
                    });
                } else {
                    res.json({success: false, message: "User is already invited"});
                }
            });
        });
    });
};

var changeStatus = function(req, res) {

  MongoClient.connect(url, function(err, db){
    var invites = db.collection('invites');
    if (req.params.id.length != 24) {
      res.json({success: false, message: "Invalid invite URL"});
    }
    invites.findOne({_id: new ObjectID(req.params.id)}, function(err, invite) {
      if (!invite) {
        res.json({success: false, message: "Invalid invite URL"});
      } else {
        if (req.body.inviteResponse != "yes" && req.body.inviteResponse != "no" && req.body.inviteResponse != "maybe") {
          res.json({success: false, message: "Invite status must be \'yes\', \'no\', or \'maybe\'."});
        } else{
          invites.update({_id: new ObjectID(req.params.id)}, {$set: {response: req.body.inviteResponse}});
          res.json({success: true, message: "Invite status updated successfully"});
        }

      }
    });
  });
};

var getEventInfo = function(req, res) {
  MongoClient.connect(url, function(err, db) {
    var invites = db.collection('invites');
    var events = db.collection('events');
    invites.findOne({_id: new ObjectID(req.params.id)}, function(err, invite) {
      if (!invite) {
        res.json({success: false, message: "Invalid invite URL"});
      } else {
        events.findOne({_id: invite.eventId}, function(err, inviteEvent) {
          if (!inviteEvent) {
            res.json({success: false, message: "Invalid invite URL"});
          } else {
            res.json({success: true, title: inviteEvent.title});
          }
        });
      }

    });
  });
};

var functions = {
    invite: inviteUser,
    changeStatus: changeStatus,
    getEventInfo: getEventInfo
};

module.exports = functions;
