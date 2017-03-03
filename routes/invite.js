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

            //TODO: Allow for inviting an array of users
            //TODO: Allow for inviting users via username/phonenumber/etc
            //TODO: Add more info to objects in invites?
            //TODO: Add notification functionality
            users.findOne({email: req.body.email}, function (err, doc) {
                if (!doc) {
                    res.json({success: false, message: "No user found with that email"})
                    return
                }

                

                var invite = {
                    owner: req.decoded._id,
                    eventID: req.body.eventID,
                    userID: doc._id,
                    response: "no",
                    update: true,
                    notification: users.findOne({_id: new ObjectID(req.decoded._id)}).firstName + ' has invited you to the event ' + events.findOne({eventID: req.body.eventID}).title 
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

var functions = {
    invite: inviteUser
};

module.exports = functions;
