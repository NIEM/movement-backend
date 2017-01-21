'use strict';
let authenticate = require('middleware/authenticate');
let errorHandler = require('middleware/errorHandler');
let cors = require('middleware/cors');

/**
 * Top-level route definitions
 * Maps endpoint URLs to route handler modules
 * Also sets the CORS headers and error handler
 */
module.exports = function(app) {
	app.use(cors);

	app.post('/login', require('./login'));
	app.post('/logout', require('./logout'));
	app.post('/addUser', require('./AddUser'));

	/**
	* Example of CRUD endpoints backed by Mongoose
	*/
	app.post('/example', authenticate, require('./example/POST'));
	app.put('/example/:id', authenticate, require('./example/PUT'));
	app.delete('/example/:id', authenticate, require('./example/DELETE'));
	app.get('/example', authenticate, require('./example/GET'));

	app.use(errorHandler);
};
