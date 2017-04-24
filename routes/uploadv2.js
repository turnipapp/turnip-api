var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var config = require('../config'); // get our config file
var url = process.env.MONGO_URL || config.database;
var fs = require('fs');

// Nonstandard
var aws = require('aws-sdk');
aws.config.loadFromPath('./s3_config.json');
var s3Bucket = new aws.S3({
    params: {
        Bucket: 'turnip-cdn'
    },
    signatureVersion: 'v4'
});


var upload = function(req, res) {
    var eventId = req.params.id;
    var file = req.files.file;

    MongoClient.connect(url, function(err, db) {
        var posts = db.collection('posts');
        var postObj = {
            userId: new ObjectID(req.decoded._id),
            eventId: eventId,
            timestamp: new Date(),
            comments: [],
            isImage: true,
            likers: []
        };
        posts.insert(postObj, function(err, result) {
            var body = fs.readFileSync(file.path);
            var payload = {
                Key: postObj._id.toString(),
                Body: body,
                ContentType: file.type,
                ACL: 'public-read'
            };
            s3Bucket.putObject(payload, function(err, data) {
                if (err) {
                    res.json({success: false, message: 'Error uploading data:'});
                } else {
                    res.json({success: true, message: 'Succesfully uploaded the image!', postId: postObj._id.toString()});
                }
            });
        });
    });
};

var functions = {
    upload: upload,
};

module.exports = functions;


var uploadimage = function(req, res) {

};
