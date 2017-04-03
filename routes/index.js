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
	* GET endpoint for requesting JSON schema
	*/
	app.get('/jsonschema', require('./jsonschema/GET'));

	app.use(errorHandler);
};
