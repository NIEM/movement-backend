'use strict';
let Thingamajig = require('models/Thingamajig');
const CONST = require('components/CONST.js');

/**
 * Example POST route handler for Express
 * This creates a new Thingamajig
 */
module.exports = function example(req, res, next) {
	var thing = new Thingamajig(
		{
			title: req.body.title,
			description: req.body.description,
			date: req.body.date
		}
	);

	function successfulSave(response) {
		return res.status(CONST.HTTP_STATUS_CODE.CREATED).send(response);
	}

	return thing.save()
	.then(successfulSave)
	.catch(next);
};
