'use strict';
let Thingamajig = require('models/Thingamajig');
const CONST = require('components/CONST.js');

/**
 * Example PUT route handler for Express
 * This updates an existing Thingamajig
 */
module.exports = function example(req, res, next) {
	return Thingamajig.findOneAndUpdate({
		_id: req.params.id
	}, {
		title: req.body.title,
		description: req.body.description,
		date: req.body.date
	}).exec().then(function(results) {
		if (results) {
			return res.status(CONST.HTTP_STATUS_CODE.OK).send(results);
		} else {
			return res.sendStatus(CONST.HTTP_STATUS_CODE.NOT_FOUND);
		}
	}).catch(next);
};
