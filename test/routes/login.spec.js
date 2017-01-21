'use strict';
const expect = require('chai').expect,
	sinon = require('sinon'),
	passport = require('passport'),
	locreq = require('locreq')(__dirname);

const CONST = locreq('components/CONST');
//Start express
locreq('index');

describe('Login', function() {
	describe('Unit Testing', function() {
		let login,
			req,
			res,
			sandbox,
			passportStub,
			next_spy;
		beforeEach(function() {
			login = locreq('routes/login');
			sandbox = sinon.sandbox.create();
			next_spy = sandbox.spy();
			passportStub = sandbox.stub(passport, 'authenticate');
			passportStub.returns(function() {});

			req = {};
			res = {
				send: sandbox.spy()
			};
		});

		afterEach(function() {
			sandbox.restore();
		});

		it('call the login function when the user is authenticated', function() {
			let userName = 'Bob';
			req['login'] = sandbox.spy();
			passportStub.callsArgWith(1, null, {user: userName});

			login(req, res, next_spy);

			expect(req.login.calledOnce).to.be.true;
			expect(req.login.calledWith({user: userName})).to.be.true;
		});

		it('should return an error', function() {
			var errorMessage = {
				error: 'Error Message'
			};
			passportStub.callsArgWith(1, errorMessage, false);
			login(req, res, next_spy);
			expect(next_spy.calledWith(errorMessage)).to.be.true;
		});

		it('should return unauthenticated', function() {
			passportStub.callsArgWith(1, null, false);
			login(req, res, next_spy);
			expect(next_spy.calledWith({
				status: CONST.HTTP_STATUS_CODE.UNAUTHENTICATED,
				error: {
					success: false,
					message: CONST.SIGNALS.AUTH_FAILED
				}
			})).to.be.true;
		});
	});
});
