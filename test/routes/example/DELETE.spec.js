'use strict';
let expect = require('chai').expect,
	sinon = require('sinon'),
	locreq = require('locreq')(__dirname);

const CONST = locreq('components/CONST');
let Thingamajig = locreq('models/Thingamajig');

locreq('index');

describe('Example: DELETE', function() {

	let exampleDELETE,
		next_spy,
		req,
		res,
		sandbox;

	beforeEach(function() {
		exampleDELETE = locreq('routes/example/DELETE');
		sandbox = sinon.sandbox.create();
		next_spy = sandbox.spy();

		req = {
			params: {
				id: '1'
			}
		};
		res = {
			sendStatus: sandbox.spy()
		};
	});

	afterEach(function() {
    Thingamajig.remove.restore();
		sandbox.restore();
	});

	it('should return an OK status when deleting something', function(done) {
    sinon.stub(Thingamajig, 'remove', function() {
			return new Promise(function(resolve) {
				resolve();
			});
		});
		exampleDELETE(req, res, next_spy).then(function() {
			expect(res.sendStatus.calledOnce).to.be.true;
			expect(res.sendStatus.calledWith(CONST.HTTP_STATUS_CODE.OK)).to.be.true;
			done();
		});
	});

	it('should pass errors to the error handler', function(done) {
    sinon.stub(Thingamajig, 'remove', function(err) {
			return new Promise(function(resolve, reject) {
				reject(err);
			});
		});

		exampleDELETE(req, res, next_spy).then(function() {
			expect(next_spy.calledOnce).to.be.true;
			done();
		});
	});

});
