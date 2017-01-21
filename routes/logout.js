'use strict';

const CONST = require('components/CONST.js');

/**
 * Request handler for the logout endpoint
 * Clears the session and destroys the req.user property
 */
module.exports = function logout(req, res) {
	req.session.destroy((err) => {
		if (err) {
			res.status(CONST.HTTP_STATUS_CODE.SERVER_ERROR).send(err);
		} else {
			res.status(CONST.HTTP_STATUS_CODE.OK).end();
		}
	});
	req.logout();
};
