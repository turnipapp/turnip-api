var MongoClient = require('mongodb').MongoClient;
var ObjectID    = require('mongodb').ObjectID;
var config      = require('../config'); // get our config file
var url         = process.env.MONGO_URL || config.database;

var userByEmail = function(req, res) {
    var email = req.params.email;

    MongoClient.connect(url, function (err, db) {
        var users = db.collection('users');

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
    });
};

var functions = {
    userByEmail: userByEmail
};

module.exports = functions;
