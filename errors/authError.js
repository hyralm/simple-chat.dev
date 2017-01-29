const util = require('util');

function AuthError(message) {
    Error.apply(this.arguments);
    Error.captureStackTrace(this, AuthError);
    this.message = message;
}
util.inherits(AuthError, Error);
AuthError.prototype.name = 'AuthError';

module.exports = AuthError;