var MongoClient = require('mongodb').MongoClient;
var ObjectID    = require('mongodb').ObjectID;
var config      = require('../config'); // get our config file
var url         = process.env.MONGO_URL || config.database;
var aws         = require('aws-sdk');
aws.config.loadFromPath('./s3_config.json');
var s3Bucket = new aws.S3({params:{Bucket: 'turnip.com/images'}});

// POST req.body.imageBinary
var uploadimage = function(req, res) {
        
    //TODO: Make private images that only buffer for auth
    try {
        buf = new Buffer(req.body.imageBinary.replace(/^data:image\/\w+;base64,/, ""),'base64')
        var data = {
            Key: req.body.imageName, 
            Body: buf,
            ContentEncoding: 'base64',
            ContentType: 'image/jpeg'
        };
        s3Bucket.putObject(data, function(err, data){
            console.log(data);
            
            if (err) { 
                res.json({message:'Error uploading data: '}); 
            } else {
                res.json({message:'Succesfully uploaded the image!'});
            }
        });
        }catch (err) {
            res.json({message:'Error'});
        }
};

var functions = {
    uploadimage: uploadimage,
};

module.exports = functions;
