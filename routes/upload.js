var MongoClient = require('mongodb').MongoClient;
var ObjectID    = require('mongodb').ObjectID;
var config      = require('../config'); // get our config file
var url         = process.env.MONGO_URL || config.database;
var aws         = require('aws-sdk');
aws.config.loadFromPath('./s3_config.json');
var s3Bucket = new aws.S3({params:{Bucket: 'turnip.com/imagess'}});
var multer = require('multer');
var fs = require('fs');

var upload = multer({dest: 'tempfiles/'}).single('name');

// POST req.body.imageBinary
var uploadimage = function(req, res) {
            //TODO: Make private images that only buffer for auth
    try {
        upload (req,res,function(req,res) {
            /*fs.readFile(req.file.image.path, function (err, data) {
                var dirname = 'tempfiles/'
                var newPath = dirname + req.body.filename;
            });
            fs.writeFile(newPath, data, function (err) {
                if (err) 
                    return res.end('Error uploading files to node server');
            });*/

        
        buf = new Buffer(req.body.imageBinary.replace(/^data:image\/\w+;base64,/, ""),'base64')
        var type;
        switch (req.body.type) {
            case 'jpeg': type = 'image/jpeg'; break;
            case 'png': type = 'image/png'; break; 
        }
            
        var data = {
            Key: req.body.imageName, 
            Body: buf,
            ContentEncoding: 'base64',
            ContentType: type 
        };
        s3Bucket.putObject(data, function(err, data){
            console.log(data);
            
            if (err) { 
                res.json({message:'Error uploading data: '}); 
            } else {
                res.json({message:'Succesfully uploaded the image!'});
            }
        });
        });
    }catch (err) {
            res.json({message: '' + err});
    }
                    return res.end('Error uploading files to node server');
};

var functions = {
    uploadimage: uploadimage
};

module.exports = functions;
