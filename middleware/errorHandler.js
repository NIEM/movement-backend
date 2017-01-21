'use strict';

const CONST = require('components/CONST.js');
/**
 * The 'Last Stop' of the Express Middleware chain. This function should catch
 * all the errors passed by calling `next()` in previous middleware layers.
 * All error handling logic should go here so random errors aren't
 * handled in the individual route controllers.
 */
function errorHandler(err, req, res, next) {		//eslint-disable-line
	//Specific status codes caught
	if (err.status) {
		return res.status(err.status).send(err);
	} else {
		//Send a generic server error
		return res.status(CONST.HTTP_STATUS_CODE.SERVER_ERROR).send(err);
	}
}

module.exports = errorHandler;
