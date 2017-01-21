'use strict';
let expect = require('chai').expect,
	sinon = require('sinon'),
	locreq = require('locreq')(__dirname);

const CONST = locreq('components/CONST');

locreq('index');

describe('Example: POST', function() {

	let examplePOST,
		next_spy,
		req,
		res,
		sandbox;

	beforeEach(function() {
		examplePOST = locreq('routes/example/POST');
		sandbox = sinon.sandbox.create();

		/**
		* Create stub request object
		*/
		req = {
			body: {
				title: 'foo',
				description: 'bar',
				date: new Date()
			}
		};

		/**
		 * Create stub response object
		 */
		res = {};
		res.status = sandbox.spy();

		/**
		 * Create spy next function
		 */
		next_spy = sandbox.spy();
	});

	afterEach(function() {
		sandbox.restore();
	});

	it('should return a CREATED status when adding something', function(done) {
		examplePOST(req, res, next_spy).then(function() {
			expect(res.status.calledOnce).to.be.true;
			expect(res.status.calledWith(CONST.HTTP_STATUS_CODE.CREATED)).to.be.true;
			done();
		});
	});


});
