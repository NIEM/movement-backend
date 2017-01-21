'use strict';
let mongoose = require('mongoose'),
    bcrypt = require('bcrypt');
/**
 * Example User Schema with a username and password field
 */
var UserSchema = mongoose.Schema({
  username: { type: String, required: true, index: { unique: true } },
  password: { type: String, required: true }
});

/**
 * Number of rounds to hash the password (aka Work Factor)
 * @link https://github.com/kelektiv/node.bcrypt.js#a-note-on-rounds
 */
const SALT_ROUNDS = 10;

/**
 * Save hook, converts the password from a string into a bcrypt salted hash
 */
UserSchema.pre('save', function(next) {
    var user = this;

    if (!user.isModified('password')) return next();

    bcrypt.genSalt(SALT_ROUNDS, function(err, salt) {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);

            user.password = hash;
            next();
        });
    });
});

/**
 * Method to validate the plaintext password with the hashed/salted password
 * @param  {[String]}   candidatePassword
 * @param  {Function} cb(err, isMatch) err - If error comparing, isMatch boolean incidating a matched password
 * @return {Promise}
 */
UserSchema.methods.validatePassword = function(candidatePassword) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return reject(err);
        resolve(isMatch);
    });
  });
};

module.exports = mongoose.model('User', UserSchema);
