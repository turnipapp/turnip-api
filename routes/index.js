var router      = require('express').Router();
var jwt         = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config      = require('../config'); // get our config file

var auth        = require('./auth');
var account     = require('./account');
var events      = require('./events');
var invite      = require('./invite');
var themes      = require('./themes');
var user        = require('./user');

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
router.get('/events/past', events.past );
router.get('/events/upcoming', events.upcoming );
router.put('/event/response', events.response);

/* Create Event*/
router.post('/event', events.create );
router.put('/invite', invite.invite );

/* Events */

/* Themes */
router.get('/themes', themes.getThemes);

/* Account */
router.get('/account', account.getAccount);

/* Users */
router.get('/user/:email', user.userByEmail);

module.exports = router;
