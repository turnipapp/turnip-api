var router      = require('express').Router();
var jwt         = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config      = require('../config'); // get our config file

var auth        = require('./auth');
var account 	= require('./account');
var events      = require('./events');
var invite      = require('./invite');
var themes      = require('./themes');
var user        = require('./user');
var event       = require('./event');
var upload      = require('./upload');
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
router.get('/events/past', events.past );
router.get('/events/upcoming', events.upcoming );
router.put('/event/response', events.response);

/* Create Event*/
router.post('/event', events.create );
router.put('/invite', invite.invite );

/* Events */
router.get('/event/:id', event.getOne);
router.get('/posts/:id', posts.getAll);

/* Posts */
router.post('/posts/create', posts.create);
router.post('/posts/edit', posts.edit);


// POST turnip.com/posts/3rhjgworibip {post content}
/* Themes *
router.get('/themes', themes.getAll)
router.get('/themes/:id', themes.getOne);

/* Account */
router.get('/account', account.getAccount);
router.post('/account/update', account.update);

/* Users */
router.get('/user/:type/:data', user.getOne);


/* Upload  (TEST) */
router.post('/uploadimage', upload.uploadimage);

module.exports = router;
