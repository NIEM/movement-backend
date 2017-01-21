'use strict';
const expect = require('chai').expect,
		locreq = require('locreq')(__dirname),
		utils = locreq('components/utilities');

describe('Utilities', function() {
	describe('#minutesToMilliseconds()', function() {
		it('should convert minutes to milliseconds', function() {
			let minutes = 1;
			expect(utils.minutesToMilliseconds(minutes)).to.equal(60000);
		});
	});
});
