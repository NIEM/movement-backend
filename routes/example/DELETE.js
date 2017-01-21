'use strict';
let Thingamajig = require('models/Thingamajig');
const CONST = require('components/CONST.js');

/**
 * Example DELETE route handler for Express
 * This deletes a Thingamajig with the given _id
 */
module.exports = function example(req, res, next) {
	return Thingamajig.remove({_id: req.params.id})
	.then(() => {
		res.sendStatus(CONST.HTTP_STATUS_CODE.OK);
	}).catch((err) => {
		return next(err);
	});
};
