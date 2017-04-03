'use strict';
let expect = require('chai').expect,
	sinon = require('sinon'),
	locreq = require('locreq')(__dirname);

locreq('index');

describe('jsonschema: GET', function() {

	let jsonschemaGET,
		next_spy,
		req,
		res,
		sandbox;
	before(function() {
		jsonschemaGET = locreq('routes/jsonschema/GET');
	});

	beforeEach(function() {
		sandbox = sinon.sandbox.create();
		next_spy = sandbox.spy();

		req = {
			query: {
				itemsToExport: ['nc:DateRange']
			}
		};
		res = {
			json: sandbox.spy()
		};
	});

	afterEach(function() {
		sandbox.restore();
	});

	it('should return data', function(done) {
		jsonschemaGET(req, res, next_spy).then(function() {
			expect(res.json.calledWith(['nc:DateRange'])).to.be.true;
			done();
		});
	});

	it('should pass errors to the error handler', function(done) {
		jsonschemaGET(req, res, next_spy).then(function() {
			expect(next_spy.calledOnce).to.be.true;
			done();
		});
	});

});
