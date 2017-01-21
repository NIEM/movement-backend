'use strict';
/**
 * Set various headers to enable CORS on client browsers
 * @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS
 * @link https://www.w3.org/wiki/CORS_Enabled
 */
module.exports = function(req, res, next) {
	res.header('Access-Control-Allow-Credentials', true);
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Authorization,X-AUTHENTICATION, X-IP');
	res.header('Access-Control-Allow-Methods', 'OPTION,GET,PUT,POST,DELETE');
	res.header('Access-Control-Allow-Origin', req.headers.origin);

	if ('OPTIONS' == req.method) {
		res.sendStatus(200);
	} else {
		next();
	}
};
