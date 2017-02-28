var MongoClient = require('mongodb').MongoClient;
var ObjectID    = require('mongodb').ObjectID;
var config      = require('../config'); // get our config file
var url         = process.env.MONGO_URL || config.database;
var valid_token = require('./valid_token');

// Expects token
exports.getAccountInfo = function(req, res) {
    MongoClient.connect(url, function(err, db) {
        var users = db.collection('users');

        var userId = req.decoded._id;
        users.findOne({"_id": new ObjectID(userId)}, function(err, document){
            res.json({success: true, firstName: document.firstName, lastName: document.lastName, email: document.email});
        });
    });
};

// Expects token, firstName, lastName, email, password, new password
exports.update = function(req, res) {
    MongoClient.connect(url, function(err, db) {
        var collection = db.collection('users');

        var userId = req.decoded._id;
        collection.findOne(ObjectId(userId), function(err, user) {
            bcrypt.compare(req.body.password, user.password, function(err, match) {
                if(!match){
                    res.json({success: false, message: 'Password incorrect'});
                } else {

                    if(req.hasOwnProperty('newPassword')){
                        updateWithPassword(req, collection, res);
                    } else {
                        updateWithoutPassword(req, collection, res);
                    }
                }
            });
        });
    });
}

function updateWithPassword(body, db, res){
    
}

function updateWithoutPassword(body, db, res){

}

function encrypt(password, callback) {
    bcrypt.hash(password, saltRounds, function(err, hash) {
        callback(err, hash);
    });
}