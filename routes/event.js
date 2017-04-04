var MongoClient = require('mongodb').MongoClient;
var ObjectID    = require('mongodb').ObjectID;
var config      = require('../config'); // get our config file
var url         = process.env.MONGO_URL || config.database;
// var appList        = require('./appList');
var fs          = require('fs');

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

var functions = {
    getOne: getOne,
    getRole: getRole,
    getTabs: getTabs,
    getAllApps: getApps,
    addOneApp: addApp,
    deleteOneApp: deleteApp,
    getLocation: getLocation
};

module.exports = functions;
