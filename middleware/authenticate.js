'use strict';

const CONST = require('components/CONST.js');

/**
 * Express Authorization Middleware
 */
module.exports = function restrict(req, res, next) {
	//Check that a user session exists
	if (req && req.session && req.session.passport && req.session.passport.user) {
		next();
	} else {
		let error = new Error();
		error.status = CONST.HTTP_STATUS_CODE.UNAUTHENTICATED;
		error.message = CONST.SIGNALS.NO_AUTH;
		return next(error);
	}
};
