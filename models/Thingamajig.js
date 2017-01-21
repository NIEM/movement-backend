'use strict';
let mongoose = require('mongoose');
/**
 * Example Mongoose Schema with save and update hooks
 * @type {[type]}
 */
var ThingamajigSchema = mongoose.Schema({
	title: {
		type: String,
		required: true
	},
	description: String,
	date: {
		type: Date,
		default: Date.now
	},
	updatedAt: {
		type: Date
	},
	createdAt: {
		type: Date
	}
});

/**
 * This function is called before an item is saved
 */
ThingamajigSchema.pre('save', function(next) {
	this.createdAt = new Date;
	next();
});

/**
 * This function is called before an item found and updated
 */
ThingamajigSchema.pre('findOneAndUpdate', function() {
  this.update({},{ $set: { updatedAt: new Date() } });
});

module.exports = mongoose.model('Thingamajig', ThingamajigSchema);
