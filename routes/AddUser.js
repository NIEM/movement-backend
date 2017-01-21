'use strict';
let User = require('models/User');
const CONST = require('components/CONST.js');

/**
 * Example POST route handler for Express
 * This creates a new User
 * This route is unprotected for demonstrative purpose
 * but should be restricted/repourposed in the final application
 */
module.exports = function example(req, res, next) {
	var user = new User(
		{
			username: req.body.username,
			password: req.body.password
		}
	);
	user.save(function(err) {
		if(err) {
			return next(err);
		}
		res.sendStatus(CONST.HTTP_STATUS_CODE.CREATED);
	});
};
