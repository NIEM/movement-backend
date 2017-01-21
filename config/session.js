'use strict';
const crypto = require('crypto'),
	session = require('express-session'),
	utils = require('components/utilities'),
	MongoStore = require('connect-mongo')(session);

/**
 * Use Express Session and Mongo Store for session management
 * @link https://github.com/expressjs/session
 * @link https://github.com/jdesboeufs/connect-mongo
 */

module.exports = function(app) {
	const cookie_options = {
		path: '/',
		httpOnly: true,
		secure: 'auto',
		maxAge: utils.minutesToMilliseconds(process.env.DEFAULT_TIMEOUT_MINUTES)
	};

  const mongo_store_options = {
    url: process.env.MONGO_CONNECTION_STRING
  };

	const session_options = {
		cookie: cookie_options,
		resave: false,
		rolling: true,
		saveUninitialized: true,
		secret: crypto.randomBytes(64).toString('hex'), //@TODO Change to static string if this needs to scale horizontally
		store: new MongoStore(mongo_store_options)
	};

	app.use(session(session_options));
};
