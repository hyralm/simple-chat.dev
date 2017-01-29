const express = require('express');
const User = require('../models/user').User;
const AuthError = require('../errors').AuthError;
const router = express.Router();

router.get('/login', function (req, res, next) {
    let data = {
        error: req.session.error
    };
    req.session.error = null;
    res.render('auth/login', data);
});

router.post('/login', function (req, res, next) {
    let username = req.body.username;
    let password = req.body.password;
    if (username && password) {
        User.authorize(username, password, function (err, user) {
            if (err) {
                if (err instanceof AuthError) {
                    req.session.error = 'Incorrect username or password.';
                    return res.redirect('back');
                } else {
                    return next(err)
                }
            }
            req.session.user = user._id;
            res.redirect('/');
        });
    } else {
        req.session.error = (!username ? 'Username' : 'Password') + ' can\'t be empty.';
        res.redirect('back');
    }
});

router.post('/logout', function (req, res, next) {
    req.session.destroy();
    res.redirect('/login');
});

module.exports = router;
