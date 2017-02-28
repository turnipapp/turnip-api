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
            if (err)
                res.json({success: false, message: 'Error while querying database'})
            if(docs.length === 0)
                res.json({success: false, message: 'No events found'})
           
            
            var upcoming = []
            var past = []
            var errmessage = '';
                
            for (var i = 0; i < docs.length; i++) {
                var dateEnd = new Date(docs[i].dateEnd);
                var now = new Date;

                if (now.getTime() < dateEnd.getTime())
                    upcoming.push (docs[i])
                else
                    past.push (docs[i])
            }
            res.send({success: true, message: 'Retrieved Events' + errmessage, upcoming, past})            
        })
    })
}

exports.invite = function (req, res) {
    MongoClient.connect(url, function (err, db) {
        if (err) {
            res.json({success: false, message: 'Error inviting user'})
        
        }
        if (!req.body.eventID || !req.decoded._id || ! req.body.userID) {
            res.json({success: false, message: 'Error inviting user: NE Info'})
            return;
        }
        var events = db.collection('events')
        var invites = db.collection('invites') 
        

        events.findOne({_id: new ObjectID(req.body.eventID), owner: req.decoded._id }, function (err, doc)  {

            if (err)
                res.json({success: false, message: 'Error retrieving event'})
            
            //TODO: Validate invitee information
            var invite = {
                owner: req.decoded._id,
                eventID: req.body.eventID,
                userID: req.body.userID
            }
            
            invites.insert(invite, function (err, result) {      
                if (err) {
                    res.json({success: false, message: "Invites insert error"})
                }
                res.json({success: true, message: "Invite created successfully"})
            })
        })   
    });
}

