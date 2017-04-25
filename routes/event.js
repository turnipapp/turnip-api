var MongoClient = require('mongodb').MongoClient;
var ObjectID    = require('mongodb').ObjectID;
var config      = require('../config'); // get our config file
var url         = process.env.MONGO_URL || config.database;
// var appList        = require('./appList');
var fs          = require('fs');
var Async       = require('async');

var getOne = function(req, res) {
    MongoClient.connect(url, function(err, db) {
        var events = db.collection('events');

        events.findOne({"_id": new ObjectID(req.params.id)}, function(err, e) {
            if(err) {
                res.json({success: false, message: 'Database error'});
            }

            res.json({success: true, event: e});
        });
    });
};

var getRole = function(req, res) {
    MongoClient.connect(url, function(err, db) {
        var events = db.collection('events');

        events.findOne({"_id": new ObjectID(req.params.id)}, function(err, e) {
            if(err) {
                res.json({success: false, message: 'Database error'});
            }

            var reqId = new ObjectID(req.decoded._id);
            var role = 'none';

            if(reqId.toString() === e.owner.toString()) {
                role = 'host';
            } else {
                events.find({"eventId": new ObjectID(req.params.id)}).toArray(function(err, invites) {
                    for (var i = 0; i < invites.length; i++) {
                        if (invites[i].userId.toString() === reqId.toString()) {
                            role = 'guest';
                        }
                    }
                });
            }

            res.json({success: true, role: role});
        });
    });
};

var getTabs = function(req, res) {
    var appsList = JSON.parse(fs.readFileSync('./routes/appList.json', 'utf8'));

    var tabs = [
        {
            name: 'Discussion',
            ref: '.discussion({id: id})',
            url: '/discussion',
            appState: 'discussion'
        }
    ];

    MongoClient.connect(url, function(err, db) {
        var apps = db.collection('apps');
        var id = new ObjectID(req.params.id);

        apps.find({'eventId': id}).toArray(function(err, addedApps) {
            if(err) {
                res.json({success: false});
            }

            var tab = {};
            for (var i = 0; i < addedApps.length; i++) {
                tabs.push(appsList[addedApps[i].appId]);
            }

            tabs.push({
                name: 'Info',
                ref: '.info({id: id})',
                url: '/info',
                appState: 'info'
            });

            var events = db.collection('events');

            events.findOne({"_id": new ObjectID(req.params.id)}, function(err, e) {
                if(err) {
                    res.json({success: false, message: 'Database error'});
                }

                var reqId = new ObjectID(req.decoded._id);

                if(reqId.toString() === e.owner.toString()) {
                    tabs.push({
                        name: 'Apps',
                        ref: '.apps({id: id})',
                        url: '/apps',
                        appState: 'apps'
                    });
                }

                var now = new Date();
                if (new Date(e.dateEnd) < now) {
                    tabs.push({
                        name: 'Memories',
                        ref: '.memories({id: id})',
                        url: '/memories',
                        appState: 'memories'
                    });
                }

                res.json({success: true, tabs: tabs});
            });

        });
    });
};

var getApps = function(req, res) {
    var appsToSend = JSON.parse(fs.readFileSync('./routes/appList.json', 'utf8'));

    MongoClient.connect(url, function(err, db) {
        var apps = db.collection('apps');

        apps.find({"eventId" : new ObjectID(req.params.id)}).toArray(function(err, docs) {
            if (err) {
                res.json({success: false, message: 'DB error'});
            } else {
                for (var i = 0; i < appsToSend.length; i++) {
                    for(var j = 0; j < docs.length; j++) {
                        if(appsToSend[i].id === docs[j].appId) {
                            appsToSend[i].status = "added";
                        }
                    }
                }

                res.json({success: true, apps: appsToSend});
            }
        });
    });
};

var addApp = function(req, res) {
    MongoClient.connect(url, function(err, db) {
        var events = db.collection('events');

        events.findOne({"_id": new ObjectID(req.params.id)}, function(err, e) {
            if (e.owner.toString() === req.decoded._id.toString()) {
                var apps = db.collection('apps');

                apps.find({"eventId": e._id}).toArray(function(err, docs) {
                    var exists = false;
                    for (var i = 0; i < docs.length; i++) {
                        if(docs[i].appId === req.body.id) {
                            exists = true;
                            break;
                        }
                    }

                    if(exists) {
                        res.json({success: false, message: 'You have already enabled this app.'});
                    } else {
                        var app = {
                            appId: req.body.id,
                            eventId: e._id,
                            addedBy: new ObjectID(req.decoded._id),
                            timestamp: new Date()
                        };

                        apps.insert(app, function (err, status) {
                            if (err) {
                                res.json({success: false, message: 'Insertion error'});
                            } else {
                                res.json({success: true, insertedCount: status.insertedCount, insertedIds: status.insertedIds});
                            }
                        });
                    }
                });

            } else {
                res.json({success: false, message: 'You are not an event host'});
            }
        });
    });
};

var deleteApp = function(req, res) {
    MongoClient.connect(url, function(err, db) {
        var events = db.collection('events');

        events.findOne({"_id": new ObjectID(req.params.id)}, function(err, e) {
            if (e.owner.toString() === req.decoded._id.toString()) {
                var apps = db.collection('apps');
                var appId = parseInt(req.params.appId);
                apps.remove({eventId: new ObjectID(req.params.id), appId: appId}, function(err, status) {
                    if (err) {
                        res.json({success: false, message: 'Error removing app'});
                    }

                    res.json({success: true});
                });
            } else {
                res.json({success: false, message: 'You are not an event host'});
            }
        });
    });
};

var getLocation = function(req, res) {
    MongoClient.connect(url, function(err, db) {
        var events = db.collection('events');

        events.findOne({"_id": new ObjectID(req.params.id)}, function(err, event) {
            if(err) {
                res.json({success: false, message: "Database error."});
            }

            res.json({location: event.location});
        });
    });
};

var deleteOne = function(req, res) {
    MongoClient.connect(url, function(err, db) {
        var events = db.collection('events');

        events.findOne({"_id": new ObjectID(req.params.id)}, function(err, event) {
            if(err) {
                res.json({success: false, message: "Database error."});
            }

            if(req.decoded._id.toString() === event.owner.toString()) {
                events.remove({"_id": event._id}, function(err, status) {
                    if (err) {
                        res.json({success: false, message: 'Error removing event'});
                    }

                    res.json({success: true});
                });
            } else {
                res.json({success: false, message: 'Invalid permissions'});
            }
        });
    });
};

var getInviteStatus = function(req, res){
  MongoClient.connect(url, function(err, db) {
    var events = db.collection('events');
    var users = db.collection('users');
    var invites = db.collection('invites');
    var yes = [];
    var no = [];
    var maybe = [];
    var pending = [];


    invites.find({"eventId": new ObjectID(req.params.id)}).toArray(function(err, eventInvites) {
      if (!eventInvites) {
        res.json({success: false, message: 'no event invites found'});
      } else{
          Async.each(eventInvites, function(invite, callback){

              users.findOne({"_id": new ObjectID(invite.userId)}, function(err, user) {

                if (!user) {
                    // hi
                } else if (invite.response == 'no') {
                    no.push(user.firstName + " " + user.lastName);
                } else if (invite.response == 'yes') {
                    yes.push(user.firstName + " " + user.lastName);
                } else if (invite.response == 'maybe') {
                    maybe.push(user.firstName + " " + user.lastName);
                } else if (invite.response == 'pending') {
                    pending.push(user.firstName + " " + user.lastName);
                }
                callback();
              });

          }, function(err) {
              res.json({success: true, yes: yes, no: no, maybe: maybe, pending: pending});
        });


        }
    });
  });
};

var guests = function(req, res) {
    MongoClient.connect(url, function(err, db) {
        var invites = db.collection('invites');
        var users = db.collection('users');

        invites.find({"eventId": new ObjectID(req.params.id)}).toArray(function(err, eventInvites) {
            var guests = [];
            Async.each(eventInvites, function(invite, callback){
                users.findOne({"_id": new ObjectID(invite.userId)}, function(err, user) {
                    if (user) {
                        var skinnyUser = {
                            firstName: user.firstName,
                            lastName: user.lastName,
                            _id: user._id
                        };
                        guests.push(skinnyUser);
                    }
                    callback();
                });
            }, function(err) {
                res.json({success: true, guests: guests});
            });
        });
    });
};

var updateInvite = function (req, res) {

    var eId = req.params.id;
    console.log("req.params.id: " + eId);
    var uId = req.decoded._id;
    console.log("uId: " + uId);
    var status = req.body.response;
    console.log("status: " + status);

    if (status === 'yes' || status === 'no' || status === 'maybe') {
        MongoClient.connect(url, function(err, db) {
            var invites = db.collection('invites');
            invites.update({userId: new ObjectID(uId), eventId: new ObjectID(eId)}, {$set: {response: status}});
            invites.findOne({userId: new ObjectID(uId), eventId: new ObjectID(eId)}, function(err, user) {
              console.log(user.response);
            });
            res.json({success: true, status: status});
        });
    } else {
        res.json({success: false, message: 'Invalid Status'});
    }
};


var functions = {
    getOne: getOne,
    getRole: getRole,
    getTabs: getTabs,
    getAllApps: getApps,
    addOneApp: addApp,
    deleteOneApp: deleteApp,
    getLocation: getLocation,
    deleteOne: deleteOne,
    getInviteStatus: getInviteStatus,
    updateInvite: updateInvite,
    guests: guests
};

module.exports = functions;
