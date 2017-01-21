'use strict';
/**
 * Misc configuration middleware options for Express
 * Includes:
 * * Bodyparser - For parsing POST bodies and the like @link https://github.com/expressjs/body-parser
 * * Helmet - Help secure express via various header options @link https://github.com/helmetjs/helmet
 */
/* istanbul ignore next */
module.exports = function(app) {
	var bodyParser   = require('body-parser');
	var helmet = require('helmet');

	app.use(bodyParser.urlencoded({extended: true}));
	app.use(bodyParser.json());
	app.use(helmet());
};
