var router      = require('express').Router();
var auth        = require('./auth');
var events      = require('./events');
var jwt         = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config      = require('../config'); // get our config file
var server      = require('./valid_token');

/**********************
 * UNPROTECTED ROUTES *
 **********************/

/* Auth */
router.post('/auth/login', function(req, res){ auth.login(req, res); } );
router.post('/auth/signup', function(req, res){ auth.signup(req, res); } );

/********************
 * PROTECTED ROUTES *
 *********************/
 // Note: This is a middleware that confirms that the token being sent is valid
router.use(function(req, res, next) {
    // check header or url parameters or post parameters for token
 	var token = req.header('token');
 	// decode token
 	if (token) {
 		// verifies secret and checks exp
 		jwt.verify(token, config.secret, function(err, decoded) {
 			if (err) {
 				return res.json({ success: false, message: 'Failed to authenticate token.' });
 			} else {
 				// if everything is good, save to request for use in other routes
 				req.decoded = decoded;
 				next();
 			}
 		});

 	} else {
 		// if there is no token
 		// return an error
 		return res.status(403).send({
 			success: false,
 			message: 'No token provided.'
 		});
 	}
});

/* Server Test - Should return 200 */
router.get('/isValidToken', function(req, res) { server.status(req, res); } );
router.post('/event', function(req, res) { events.create(req, res); } );
router.post('/events/upcoming', function(req, res) { events.upcoming(req, res); } );
router.post('/event/past', function (req, res) { events.past(req, res); } );
router.post('/event/response', function (req, res) { events.response(req, res); } );
router.post('/account/getAccountInfo', function(req, res){ account.getAccountInfo(req, res); } );

module.exports = router;
