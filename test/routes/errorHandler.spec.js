// 'use strict';
// let expect = require('chai').expect,
// 	sinon = require('sinon');
//
// const CONST = require('../../components/CONST.js');
// describe('Error Handler', function() {
//
// 	let errorHandler,
// 		err,
// 		req,
// 		res,
// 		sandbox;
// 	beforeEach(function() {
// 		sandbox = sinon.sandbox.create();
// 		errorHandler = require('../../routes/errorHandler');
// 		err = {};
// 		req = {};
// 		res = {
// 			status: function() { }
// 		};
// 		sandbox.stub(res, 'status', function() {
// 			return { send: sandbox.spy() };
// 		});
//
// 	});
//
// 	afterEach(function() {
// 		sandbox.restore();
// 	});
//
// 	it('should handle connection timeout errors', function() {
// 		err.code = 'ETIMEDOUT';
// 		err.connect = true;
//
// 		errorHandler(err, req, res);
// 		expect(res.status.calledWith(CONST.HTTP_STATUS_CODE.CONNECT_TIMEOUT)).to.be.true;
// 	});
//
// 	it('should handle socket timeout errors', function() {
// 		err.code = 'ETIMEDOUT';
// 		err.connect = false;
//
// 		errorHandler(err, req, res);
// 		expect(res.status.calledWith(CONST.HTTP_STATUS_CODE.READ_TIMEOUT)).to.be.true;
// 	});
//
// 	it('should forward specific error codes', function() {
// 		let status = 499;
// 		err.status = status;
//
// 		errorHandler(err, req, res);
// 		expect(res.status.calledWith(status)).to.be.true;
// 	});
//
// 	it('should return a generic error for all others', function() {
// 		errorHandler(err, req, res);
// 		expect(res.status.calledWith(CONST.HTTP_STATUS_CODE.SERVER_ERROR)).to.be.true;
// 	});
//
//
// });
