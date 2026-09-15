const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const { storeReturnTo } = require('../middleware');
const users = require('../controllers/users');

//'register()' is a static method added to the 'User' model by 'passport-local-mongoose'.

router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register))

// Use the 'storeReturnTo' middleware to save the returnTo value from sessions to res.locals.
// 'passport.authenticate' logs the user in and clears 'req.session'.
// Now we can use 'res.locals.returnTo' to redirect the user after login.
router.route('/login')
    .get(users.renderLogin)
    .post(storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login'}), users.login)


router.get('/logout', users.logout);

module.exports = router;

