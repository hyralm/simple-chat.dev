module.exports = function (req, res, next) {
    if (!req.session.user) {
        req.session.error = 'Please log in.';
        res.redirect('/login');
    } else {
        next();
    }
};
