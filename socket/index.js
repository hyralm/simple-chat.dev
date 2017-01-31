const cookie = require('cookie');
const cookieParser = require('cookie-parser');
const async = require('async');

const config = require('../config');
const User = require('../models/user').User;
const sessionStore = require('../libs/sessionStore');
const log = require('../libs/log')(module);

module.exports = function (server) {
    const io = require('socket.io')(server);

    function loadSession(sid, callback) {
        sessionStore.load(sid, function (err, session) {
            if (arguments.length == 0) {
                return callback(null, null);
            } else {
                return callback(null, session);
            }
        });
    }

    function loadUser(session, callback) {
        if (!session.user) {
            return callback(null, null);
        }
        User.findById(session.user, function (err, user) {
            if (err) return callback(err);
            if (!user) return callback(null, null);
            callback(null, user);
        })
    }

    io.use(function (socket, next) {
        async.waterfall([
            function (callback) {
                let handshakeCookies = cookie.parse(socket.request.headers.cookie || '');
                let sid = cookieParser.signedCookie(handshakeCookies[config.get('session:name')], config.get('session:secret'));
                loadSession(sid, callback);
            },
            function (session, callback) {
                if (!session) return new Error(401, 'No session.'); // TODO: add error handler
                socket.request.session = session;
                loadUser(session, callback);
            },
            function (user, callback) {
                if (!user) return new Error(403, 'Anonymous session may not connect.'); // TODO: add error handler
                socket.request.user = user;
                callback(null);
            }
        ], function (err, result) {
            if (err) return next(err);
            next();
        });
    });

    io.on('session:reload', function (sid) {
        let sockets = io.clients().sockets;
        io.clients(function (err, clients) {
            if (err) return new Error(401, 'No clients.'); // TODO: add error handler
            clients.forEach(function (item, i, arr) {
                let socket = sockets[item];
                if (socket.request.session.user !== sid) return false;
                loadSession(sid, function (err, session) {
                    if (err) {
                        socket.emit('error', 'Server error.');
                        socket.disconnect();
                        return false;
                    }
                    if (!session) {
                        socket.emit('logout');
                        socket.disconnect();
                        return false;
                    }
                    socket.request.session = session;
                });
            });
        });
    });

    io.on('connection', function (socket) {
        let username = socket.request.user.username;
        socket.broadcast.emit('join', username);
        socket.on('message', function (text, callback) {
            socket.broadcast.emit('message', username, text);
            callback();
        });
        socket.on('disconnect', function () {
            socket.broadcast.emit('leave', username);
        });
    });

    return io;
};
