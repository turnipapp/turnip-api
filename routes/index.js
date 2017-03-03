var router      = require('express').Router();
var jwt         = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config      = require('../config'); // get our config file

var auth        = require('./auth');
var account 	= require('./account');
var account     = require('./account');
var events      = require('./events');
var invite      = require('./invite');
var themes      = require('./themes');
var user        = require('./user');
var event       = require('./event');

/**********************
 * UNPROTECTED ROUTES *
 **********************/

/* Auth */
router.post('/auth/login', auth.login);
router.post('/auth/signup', auth.signup);

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
router.post('/events/past', function (req, res) { events.past(req, res); } );
router.put('/events/response', function (req, res) { events.response(req, res); } );
router.post('/account/getAccountInfo', function(req, res){ account.getAccountInfo(req, res); } );
router.post('/account/update', function(req, res){ account.update(req, res); } );
router.get('/isValidToken', 			function(req, res){ server.status(req, res); } );
router.post('/event', 					function(req, res){ events.create(req, res); } );
router.post('/events/upcoming',			function(req, res){ events.upcoming(req, res); } );
router.post('/account/getAccountInfo',	function(req, res){ account.getAccountInfo(req, res); } );
router.post('/account/update', 			function(req, res){ account.update(req, res); } );
router.get('/isValidToken', function(req, res) { server.status(req, res); } );
router.post('/event', function(req, res) { events.create(req, res); } );
router.post('/events/upcoming', function(req, res) { events.upcoming(req, res); } );
router.post('/events/invite', function (req, res) { events.invite(req, res); } );
router.post('/events/past', function (req, res) { events.past(req, res); } );
router.put('/events/response', function (req, res) { events.response(req, res); } );
router.get('/account', function(req, res){ account.getAccountInfo(req, res); } );

router.use(auth.verifyToken);

/* Dashboard */
router.get('/events/notify', events.notify);   //Events with unread notifications
router.get('/events/past', events.past );
router.get('/events/upcoming', events.upcoming );
router.put('/event/response', events.response);

/* Create Event*/
router.post('/event', events.create );
router.put('/invite', invite.invite );

/* Events */
router.get('/event/:id', event.getOne);

/* Themes */
router.get('/themes', themes.getAll);
router.get('/themes/:id', themes.getOne);

/* Account */
router.get('/account', account.getAccount);

/* Users */
router.get('/user/:type/:data', user.getOne);


module.exports = router;
