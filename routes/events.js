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
          
          var date = new Date();
          var dateStart = new Date(req.body.dateStart);
          var dateEnd = new Date(req.body.dateEnd);

          if (date.getTime() > dateStart.getTime() || dateEnd.getTime() < dateStart.getTime()) {
            res.json({success: false, message: 'Invalid date'})
            return;
          }

          var events = db.collection('events');
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
              var invites = db.collection('invites');
              var invite = {
                    owner: new ObjectID(req.decoded._id),
                    eventID: result.ops[0]._id,
                    userID: new ObjectID(req.decoded._id),
                    response: "yes",
                    update: true,
                    notification: null
              }
              invites.insert(invite, function (err) {
                if (err) {
                    res.json({success: false, message: 'Failed to invite owner'});
                    return;
                }
              })
              
              // Insert req.body.invites array as separate entries
                res.json({success: true, message: 'Event created Successfully', eventId: result.ops[0]._id});
                return;

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
        var events = db.collection('events');

        invites.find({userID: new ObjectID(req.decoded._id)}).toArray(function(err, docs){
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
            
            var eventids = docs.map(function (doc) {  return new ObjectID(doc.eventID)});

            events.find({_id: {$in: eventids}}).toArray(function(error, allevents) {
                   for (var x = 0; x < allevents.length; x++) { 
                        var dateEnd = new Date(allevents[x].dateEnd);
                        var now = new Date();

                        if (now.getTime() < dateEnd.getTime()) {
                            upcoming.push (allevents[x]);
                        } else {
                            past.push (allevents[x]);
                        }
                   }
                  
                    res.json({success: true, message: 'Retrieved Events' + errmessage, upcoming, past});
                
                    return; 
            })

        })
    })
}
/*
var past = function(req, res) {
    MongoClient.connect(url, function(err, db) {

        /*
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
*/

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
  past: upcoming,
  notify: notify
};

module.exports = functions;
