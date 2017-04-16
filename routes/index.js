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
var upload      = require('./upload.js');
var posts       = require('./posts');
var notifications  = require('./notifications');
var spotify     = require('./spotify');
var weather     = require('./weather');

/**********************
 * UNPROTECTED ROUTES *
 **********************/

/* Auth */
router.post('/auth/login', auth.login);
router.post('/auth/signup', auth.signup);
router.put('/invite/:id', invite.changeStatus );

router.get('/invite/:id', invite.getEventInfo);

/********************
 * PROTECTED ROUTES *
 *********************/

router.use(auth.verifyToken);

/* Dashboard */
router.get('/events/notify', events.notify);   //Events with unread notifications
router.get('/events/past', events.past );
router.get('/events/upcoming', events.upcoming );
router.get('/events/info/:eventId', events.info);
router.put('/event/response', events.response);

/* Create Event*/
router.post('/event', events.create );
router.put('/invite', invite.invite );

/* Events */
router.get('/event/:id', event.getOne);
router.get('/event/:id/apps', event.getAllApps);
router.post('/event/:id/apps', event.addOneApp);
router.delete('/event/:id/apps/:appId', event.deleteOneApp);
router.get('/event/:id/role', event.getRole);
router.get('/event/:id/tabs', event.getTabs);
router.get('/posts/:id', posts.getAll);
router.post('/posts/:id/like', posts.like);
router.get('/event/:id/getLocation', event.getLocation);
router.get('/event/:id/getInviteStatus', event.getInviteStatus);

router.delete('/event/:id', event.deleteOne);

/* Posts */
router.post('/posts/:id', posts.create);
router.put('/posts/:post_id', posts.edit);
router.delete('/posts/:post_id', posts.delete);
router.post('/posts/:id/comment', posts.addComment);


// POST turnip.com/posts/3rhjgworibip {post content}
/* Themes */
router.get('/themes', themes.getAll);
router.get('/themes/:id', themes.getOne);

/* Account */
router.get('/account', account.getAccount);
//router.get('/account/public', account.getPublicAccount);
router.put('/account/update', account.update);

/* Users */
router.get('/user/:type/:data', user.getOne);


/* Upload  (TEST) */
router.put('/upload', upload.uploadimage);

/* Notifications */
router.get('/notifications/get', notifications.get);

/* Spotify */
router.post('/spotify/:eventId', spotify.createPlaylist);
router.post('/spotify/:eventId/addSong', spotify.addSong);
router.get('/spotify/search/:searchQuery', spotify.search);
router.get('/spotify/:eventId', spotify.getSongs);
router.get('/spotify/:eventId/generateString', spotify.generateString);

/* Weather */
router.get('/weather/get/:eventId', weather.get);

module.exports = router;
