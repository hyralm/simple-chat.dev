const express = require('express');
const router = express.Router();
const checkAuth = require('../middlewares/checkAuth');
const User = require('../models/user').User;

router.use(checkAuth);

/* GET users listing. */
router.get('/', function (req, res, next) {
    User.find({}, function (err, users) {
        if (err) return next(err);
        res.render('user/index', {users: users});
    });
});

module.exports = router;
