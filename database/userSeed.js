const async = require('async');
const mongoose = require('../libs/mongoose');

async.series([
    open,
    dropDatabase,
    requireModels,
    createUsers
], function (err) {
    mongoose.disconnect();
    process.exit(err ? 1 : 0);
});

function open(callback) {
    mongoose.connection.on('open', callback);
}

function dropDatabase(callback) {
    const db = mongoose.connection.db;
    db.dropDatabase(callback);
}

function requireModels(callback) {
    require('../models/user');
    async.each(Object.keys(mongoose.models), function (modelName, callback) {
        mongoose.models[modelName].ensureIndexes(callback);
    }, callback);
}

function createUsers(callback) {
    let users = [
        {username: 'user_one', password: 'password_one'},
        {username: 'user_two', password: 'password_two'},
        {username: 'user_three', password: 'password_three'}
    ];
    async.each(users, function (userData, callback) {
        let user = new mongoose.models.User(userData);
        user.save(callback);
    }, callback);
}
