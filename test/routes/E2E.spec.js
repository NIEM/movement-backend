'use strict';
const expect = require('chai').expect,
	request = require('request'),
	locreq = require('locreq')(__dirname);

const CONST = locreq('components/CONST');
//Start express
locreq('index');

describe('E2E Testing', function() {
	const User = locreq('models/User');
	const USER_NAME = 'testUser';
	const PASSWORD = 'testPW';

	function login(username, pw) {
		return new Promise(function(resolve, reject) {
			request({
				method: 'POST',
				url: 'http://localhost:7000/login',
				json: true,
				body: {
					username: username,
					password: pw
				}
			}, function (err, response, body) {
				if(err) return reject(err);
				resolve(response, body);
			});
		});
	}
	beforeEach(function(done) {
		request({
			method: 'POST',
			url: 'http://localhost:7000/addUser',
			json: true,
			body: {
				username: USER_NAME,
				password: PASSWORD
			}
		}, function (err) {
			if(err) return done(err);
			done();
		});
	});

	afterEach(function(done) {
		User.remove({ username: USER_NAME }).then(function() {
			done();
		});
	});

	it('should login successfully', function(done) {
		login(USER_NAME, PASSWORD).then(function(response) {
			expect(response.statusCode).to.equal(CONST.HTTP_STATUS_CODE.OK);
			done();
		})
		.catch(function(error) {
			done(error);
		});
	});

	it('should not login when the password is incorrect', function(done) {
		login(USER_NAME, 'wrong passowrd').then(function(response) {
			expect(response.statusCode).to.equal(CONST.HTTP_STATUS_CODE.UNAUTHENTICATED);
			done();
		})
		.catch(function(error) {
			done(error);
		});
	});

	it('should not login when the username is incorrect', function(done) {
		login('some user', 'wrong passowrd').then(function(response) {
			expect(response.statusCode).to.equal(CONST.HTTP_STATUS_CODE.UNAUTHENTICATED);
			done();
		})
		.catch(function(error) {
			done(error);
		});
	});

	it('should login and allow access to a protected route', function(done) {
		login(USER_NAME, PASSWORD).then(function(response) {
			expect(response.statusCode).to.equal(CONST.HTTP_STATUS_CODE.OK);
			let cookie = response.headers['set-cookie'][0].split(';')[0];

			request({
				method: 'GET',
				headers: {
					'Cookie': cookie
				},
				url: 'http://localhost:7000/example',
			}, function (err, get_response) {
				if(err) return done(err);
				expect(get_response.statusCode).to.equal(CONST.HTTP_STATUS_CODE.OK);
				done();
			});
		});
	});

	it('should not allow access to a protected route', function(done) {
		request({
			method: 'GET',
			url: 'http://localhost:7000/example',
		}, function (err, get_response) {
			if(err) return done(err);
			expect(get_response.statusCode).to.equal(CONST.HTTP_STATUS_CODE.UNAUTHENTICATED);
			done();
		});
	});
});
