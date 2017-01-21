'use strict';

/**
* Converts minutes to milliseconds
* @param {number} - minutes
* @returns {number} - milliseconds
*/
function minutesToMilliseconds(minutes) {
	return minutes * 60 * 1000;
}

module.exports = {
  minutesToMilliseconds: minutesToMilliseconds
};
