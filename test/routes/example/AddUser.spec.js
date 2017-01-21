'use strict';
let expect = require('chai').expect,
	sinon = require('sinon'),
	locreq = require('locreq')(__dirname);

let Thingamajig = locreq('models/Thingamajig');

locreq('index');

describe('Example: GET', function() {

	let exampleGET,
		next_spy,
		req,
		res,
		sandbox;
	before(function() {
		exampleGET = locreq('routes/example/GET');
	});

	beforeEach(function() {
		sandbox = sinon.sandbox.create();
		next_spy = sandbox.spy();

		req = {};
		res = {
			json: sandbox.spy()
		};
	});

	afterEach(function() {
    Thingamajig.find.restore();
		sandbox.restore();
	});

	it('should return data', function(done) {
    sinon.stub(Thingamajig, 'find', function() {
			return new Promise(function(resolve) {
				resolve('foo');
			});
		});

		exampleGET(req, res, next_spy).then(function() {
			expect(res.json.calledWith('foo')).to.be.true;
			done();
		});
	});

	it('should pass errors to the error handler', function(done) {
    sinon.stub(Thingamajig, 'find', function(err) {
			return new Promise(function(resolve, reject) {
				reject(err);
			});
		});

		exampleGET(req, res, next_spy).then(function() {
			expect(next_spy.calledOnce).to.be.true;
			done();
		});
	});

});
