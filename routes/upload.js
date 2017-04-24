var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var config = require('../config'); // get our config file
var url = process.env.MONGO_URL || config.database;
var aws = require('aws-sdk');
aws.config.loadFromPath('./s3_config.json');
var s3Bucket = new aws.S3({
    params: {
        Bucket: 'turnip.com/imagess'
    }
});
var multer = require('multer');
var fs = require('fs');
var upload = multer({ dest: 'upload/'});

var upload = multer({
    dest: 'tempfiles/'
}).single('photo');

// POST req.body.imageBinary
var uploadimage = function(req, res) {
    console.log(req.file);
    //TODO: Make private images that only buffer for auth
    MongoClient.connect(url, function(err, db) {
        if (err) {
            res.json({success: false, message: "Error accessing DB"});
            return;
        }

        try {
            var path = "";
            if (!fs.existsSync('tempfiles/')) {
                fs.mkdirSync('tempfiles/');
            }
            upload(req, res, function(err) {
                if (err) {
                    console.log(err);
                    res.json({
                        success: false,
                        message: "Error uploading image"
                    });
                    return;
                }

                var posts = db.collection('posts');

                var postObj = {
                    text: req.body.text,
                    userId: new ObjectID(req.decoded._id),
                    eventId: req.body.eventId,
                    timestamp: new Date(),
                    comments: [],
                    isImage: true
                };

                posts.insert(postObj, function(err, result) {

                    var data = {
                        Key: '' + postObj._id,
                        Body: fs.createReadStream(req.file.path)
                    };
                    s3Bucket.putObject(data, function(err) {
                        if (err) {
                            res.json({
                                message: 'Error uploading data: '
                            });
                            return;
                        } else {
                            res.json({
                                message: 'Succesfully uploaded the image!'
                            });
                            return;
                        }
                    });



                    fs.unlinkSync(req.file.path);
                });
            });
        } catch (error) {
            res.json({
                message: '' + error
            });
        }
    });
};

var functions = {
    uploadimage: uploadimage
};

module.exports = functions;
