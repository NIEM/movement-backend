'use strict';
const expect = require('chai').expect,
	sinon = require('sinon'),
	locreq = require('locreq')(__dirname),
	_ = require('lodash');

const CONST = locreq('components/CONST');
let Thingamajig = locreq('models/Thingamajig');

locreq('index');

describe('Example: PUT', function() {

	let examplePUT,
		next_spy,
		req,
		res,
		test_thing,
		sandbox;

	beforeEach(function(done) {
		examplePUT = locreq('routes/example/PUT');
		sandbox = sinon.sandbox.create();

		/**
		* Create stub request object
		*/
		req = {
			params: {},
			body: {
				title: 'foo',
				description: 'bar',
				date: new Date()
			}
		};

		test_thing = new Thingamajig(req.body);
		test_thing.save().then(function(resp) {
			req.params.id = resp._id;
			done();
		});
		/**
		 * Create stub response object
		 */
		res = {};
		res.status = sandbox.spy();
		res.sendStatus = sandbox.spy();

		/**
		 * Create spy next function
		 */
		next_spy = sandbox.spy();
	});

	afterEach(function(done) {
		Thingamajig.remove({_id: req.params.id}).then(function() { done(); });
		sandbox.restore();
	});

	it('should return a OK status when updating something', function(done) {
		examplePUT(req, res, next_spy).then(function() {
			expect(res.status.calledOnce).to.be.true;
			expect(res.status.calledWith(CONST.HTTP_STATUS_CODE.OK)).to.be.true;
			done();
		});
	});

	it('should return a NOT FOUND status when unable to locate a record to update', function(done) {
		var mock_req = _.cloneDeep(req);
		mock_req.params.id = null;
		examplePUT(mock_req, res, next_spy).then(function() {
			expect(res.sendStatus.calledOnce).to.be.true;
			expect(res.sendStatus.calledWith(CONST.HTTP_STATUS_CODE.NOT_FOUND)).to.be.true;
			done();
		});
	});


});
