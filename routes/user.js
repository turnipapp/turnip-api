var MongoClient = require('mongodb').MongoClient;
var ObjectID    = require('mongodb').ObjectID;
var config      = require('../config'); // get our config file
var url         = process.env.MONGO_URL || config.database;

var getOne = function(req, res) {
    MongoClient.connect(url, function (err, db) {
        var users = db.collection('users');

        if(req.params.type === 'id') {
            users.findOne({"_id": new ObjectID(req.params.data)}, function(err, user) {
                if(err) {
                    res.json({success: false});
                }
                if(user) {
                    var name = user.firstName + " " + user.lastName;
                    res.json({success: true, user: true, name: name, id: user._id, email: email});
                } else {
                    res.json({success: true, user: false, email: email, name: 'Requires Invite'});
                }
            });
        } else if (req.params.type === 'email') {
            var email = req.params.data;
            users.findOne({email: email}, function(err, user) {
                if(err) {
                    res.json({success: false});
                }
                if(user) {
                    var name = user.firstName + " " + user.lastName;
                    res.json({success: true, user: true, name: name, id: user._id, email: email});
                } else {
                    res.json({success: true, user: false, email: email, name: 'Requires Invite'});
                }
            });
        } else {
            res.json({success: false, message: 'Unsupported find type'});
        }
    });
};

var functions = {
    getOne: getOne
};

module.exports = functions;
