const express = require('express');
const router = express.Router();

const checkAuth = require('../middlewares/checkAuth');

router.get('/', checkAuth, function (req, res, next) {
    res.render('chat/index');
});

module.exports = router;
