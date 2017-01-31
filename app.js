'use strict';

/**
 * Module dependencies.
 */
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');

const config = require('./config');
const sessionStore = require('./libs/sessionStore');

/**
 * Middleware dependencies.
 */
const loadUsers = require('./middlewares/loadUser');

/**
 * Route dependencies.
 */
const auth = require('./routes/auth');
const chat = require('./routes/chat');
const index = require('./routes/index');
const users = require('./routes/users');

/**
 * Creating app
 */
const app = express();

/**
 * View engine setup
 */
app.engine('ejs', require('ejs-locals'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/**
 * Middlewares
 */
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(session({
    secret: config.get('session:secret'),
    cookie: config.get('session:cookie'),
    resave: config.get('session:resave'),
    saveUninitialized: config.get('session:saveUninitialized'),
    store: sessionStore
}));
app.use(loadUsers);
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Routes
 */
app.use('/', auth);
app.use('/', index);
app.use('/chat', chat);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
