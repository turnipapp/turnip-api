var MongoClient = require('mongodb').MongoClient;
var ObjectID    = require('mongodb').ObjectID;
var config      = require('../config'); // get our config file
var url         = process.env.MONGO_URL || config.database;

var getnotifications = function (req, res) {
    MongoClient.connect(url, function(err, db) {
        /*
          Retrieves users notification settings
        */
        var users = db.collection('users');
        var user = users.findOne({_id: new ObjectID(req.decoded._id)});
        console.log (user.firstName);
        /*
          Filters and returns notifications
        */
        var filtered = [];
        var invites = db.collection('invites');
        
    }
}

var functions = {
    get: getnotifications
}

modules.exports = functions;
