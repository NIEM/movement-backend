'use strict';
var passport = require('passport'),
		LocalStrategy = require('passport-local').Strategy,
		User = require('models/User');

/**
 * Use Passport for authentication
 * @link http://passportjs.org/docs
 */
module.exports = function(app) {
	/**
	* In order to restore authentication state across HTTP requests, Passport needs
	* to serialize users into and deserialize users out of the session.  The
	* typical implementation of this is as simple as supplying the user ID when
	* serializing, and querying the user record by ID from the database when
	* deserializing.
	*/
	passport.serializeUser((user, cb) => {
		cb(null, user.id);
	});

	passport.deserializeUser((id, cb) => {
		User.findById(id).then((user) =>{
			cb(null, user);
		}).catch((err) => {
			return cb(err);
		});
	});

	/**
	* The local strategy require a `verify` function which receives the credentials
	* (`username` and `password`) submitted by the user.  The function must verify
	* that the password is correct and then invoke `done` with a user object, which
	* will be set at `req.user` in route handlers after authentication.
	*/
	let localStrategy = new LocalStrategy(
		function(username, password, done) {
			User.findOne({ username: username }).then((user) => {
				if (!user) { return done(null, false); }

				return user.validatePassword(password).then((isMatch) => {
					if(!isMatch) {
						return done(null, false);
					} else {
						return done(null, user);
					}
				});
			}).catch(function(error) {
				return done(error);
			});
		}
	);

	app.use(passport.initialize());
	app.use(passport.session());
	passport.use(localStrategy);
};
