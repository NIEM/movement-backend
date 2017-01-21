'use strict';
let Thingamajig = require('models/Thingamajig');

/**
 * Example route handler for Express
 * This returns a list of Thingamajigs
 */
module.exports = function example(req, res, next) {
	return Thingamajig.find().then((thingamajigs) => {
		return res.json(thingamajigs);
	})
	.catch((err) => {
		return next(err);
	});
};
