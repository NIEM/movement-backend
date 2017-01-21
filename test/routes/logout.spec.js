'use strict';
const expect = require('chai').expect,
	sinon = require('sinon'),
	locreq = require('locreq')(__dirname);

const CONST = locreq('components/CONST');
describe('Logout', function() {

	let logout,
		req,
		res,
		sandbox,
		stub;
	beforeEach(function() {
		sandbox = sinon.sandbox.create();
		logout = locreq('routes/logout');
		req = {
			session: {
				destroy: function() {}
			},
      logout: sandbox.spy()
		};
		stub = sandbox.stub(req.session, 'destroy');
		stub.returns(function() {});
		res = {
			status: function() { }
		};
		sandbox.stub(res, 'status', function() {
			return {send: sandbox.spy(), end: sandbox.spy()};
		});
	});

	afterEach(function() {
		sandbox.restore();
	});

	it('should destroy the session and send a status of OK if no error', function() {
		stub.callsArgWith(0, null);
		logout(req, res);
		expect(res.status.calledWith(CONST.HTTP_STATUS_CODE.OK)).to.be.true;
	});

	it('should destroy the session and send a status of 500 if error', function() {
		let errorBody = {
			error: 'Error'
		};
		stub.callsArgWith(0, errorBody);
		logout(req, res);
		expect(res.status.calledWith(CONST.HTTP_STATUS_CODE.SERVER_ERROR)).to.be.true;
	});

});
