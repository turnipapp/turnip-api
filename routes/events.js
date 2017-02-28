var MongoClient = require('mongodb').MongoClient;
var ObjectID    = require('mongodb').ObjectID;
var config      = require('../config'); // get our config file
var url         = process.env.MONGO_URL || config.database;
var valid_token = require('./valid_token');


/************************************
 *
 *          CREATE
 *
*************************************/
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

/************************************
 *
 *          RESPONSE
 *
*************************************/
exports.response = function(req, res) {
  MongoClient.connect(url, function(err, db) {
    var users = db.collection('users');
    
    if (req.body.response != "no" 
        && req.body.response != "yes"
        && req.body.response != "maybe") {
        
        res.json({success: false, message: 'Invalid response'})
        return
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
}

/************************************
 *
 *          UPCOMING
 *
*************************************/
exports.upcoming = function(req, res) {
    MongoClient.connect(url, function(err, db) {

        var collection = db.collection('events');

        collection.find({email: req.decoded.email}).toArray(function(err, docs){
            if (err) {
                res.json({success: false, message: 'Error while querying database'})
                return
            }
            if(docs.length === 0) {
                res.json({success: false, message: 'No events found'})
                return
            }
            
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

/************************************
 *
 *             INVITE
 *
*************************************/
exports.invite = function (req, res) {
    MongoClient.connect(url, function (err, db) {
        if (err) {
            res.json({success: false, message: 'Error inviting user'})
        
        }
        if (!req.body.eventID || !req.decoded._id || ! req.body.userID) {
            res.json({success: false, message: 'Error inviting user: NE Info'})
            return
        }
        var events = db.collection('events')
        var users = db.collection('users')
        var invites = db.collection('invites') 
        

        events.findOne({_id: new ObjectID(req.body.eventID), owner: req.decoded._id }, function (err)  {
            if (err) {
                res.json({success: false, message: 'Error retrieving event'}) 
                return
            }   
            
            //Find User (will add multiple later)    
            users.findOne({email: req.body.email}, function (err, doc) {
                if (!doc) {
                    res.json({success: false, message: "No user found with that email"})
                    return
                }
                var invite = {
                    owner: req.decoded._id,
                    eventID: req.body.eventID,
                    userID: doc._id,
                    response: "no" 
                } 
                var invited = invites.find({eventID: req.body.eventID, userID: doc._id})        
                if (!invited) {
                    invites.insert(invite, function (err, result) {      
                        if (err) {
                            res.json({success: false, message: "Invites insert error"})
                            return
                        }
                        res.json({success: true, message: "User invited successfully"})
                        return
                    })
                } else {
                    res.json({success: false, message: "User is already invited"})
                }
            })

        })  
    })
}

