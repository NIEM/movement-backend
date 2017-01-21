let mongoose = require('mongoose');
/**
 * Creates a connection to the MongoDB
 * @param  {String} connectionString - mongoDB connection string @example 'mongodb://localhost/test'
 * @return {Promise}
 */
module.exports = function(connectionString) {
	return new Promise((resolve, reject) => {
		// Use native promises
		mongoose.Promise = global.Promise;
		mongoose.connect(connectionString, {
			server: {
				socketOptions: {
					keepAlive: 1
				}
			}
		});

		mongoose.connection.on('error', () => {
			return reject(new Error(`unable to connect to database: ${process.env.MONGO_CONNECTION_STRING}`));
		});
		mongoose.connection.once('open', () => {
			return resolve();
		});
	});
};
