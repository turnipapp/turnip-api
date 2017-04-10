var express         = require('express');
var app             = express();
var bodyParser      = require('body-parser');
var mongodb         = require('mongodb').MongoClient;
var cors            = require('cors');
var mongoUrl        = process.env.MONGO_URL || 'mongodb://localhost:27017/rachis';
var mongoSessionUrl = process.env.MONGO_SESSION_URL || 'mongodb://localhost:27017/rachis';
var port            = process.env.PORT || 5000;
var logger          = require('morgan');
var aws             = require('aws-sdk');
var multer          = require('multer');

// JSON WEB TOKEN
app.set('superSecret', 'ThIsIsSoSeCrEt'); // secret variable

// AWS S3
app.engine('html', require('ejs').renderFile);

/* Cors
 * Allows for external services to make API requests
 */
app.use(cors());
app.use(logger('dev'));

/* Body Parser
 * Parses incoming requests and puts them in the req.body
 * variable
 */
 app.use(bodyParser.urlencoded({ extended: false }));
 app.use(bodyParser.json());


 app.use(multer({ dest: 'tempfiles/'}).single('photo'));
/* External Routes
 * Abstratcs out routes
 */
app.use('/', require('./routes'));

app.listen(port);
console.log("Listening on port " + port);

