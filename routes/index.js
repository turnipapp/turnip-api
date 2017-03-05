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
var posts       = require('./posts');

/**********************
 * UNPROTECTED ROUTES *
 **********************/

/* Auth */
router.post('/auth/login', auth.login);
router.post('/auth/signup', auth.signup);

/********************
 * PROTECTED ROUTES *
 *********************/

router.use(auth.verifyToken);

/* Dashboard */
router.get('/events/notify', events.notify);   //Events with unread notifications
router.get('/events/past', events.upcoming );
router.get('/events/upcoming', events.upcoming );
router.put('/event/response', events.response);

/* Create Event*/
router.post('/event', events.create );
router.put('/invite', invite.invite );

/* Events */
router.get('/event/:id', event.getOne);
router.get('/posts/:id', posts.getAll);
router.post('/posts/:id', posts.create);

/* Themes */
router.get('/themes', themes.getAll);
router.get('/themes/:id', themes.getOne);

/* Account */
router.get('/account', account.getAccount);
router.put('/account', account.updateAccount);

/* Users */
router.get('/user/:type/:data', user.getOne);


module.exports = router;
