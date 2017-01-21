'use strict';

/**
 * Map of constant values used throughout the application
 * @type {Object}
 */
/* istanbul ignore next */
module.exports = {
  HTTP_STATUS_CODE : {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST : 400,
    UNAUTHENTICATED: 401,
    UNAUTHORIZED: 403,
    NOT_FOUND: 404,
    UNSUPPORTED_MEDIA_TYPE: 415,
    READ_TIMEOUT: 408,
    SERVER_ERROR: 500,
    BAD_GATEWAY: 502,
    CONNECT_TIMEOUT: 504
  },
  CONTENT_TYPES : {
    JSON: 'application/json',
    FORM: 'application/x-www-form-urlencoded'
  },
  SIGNALS: {
    AUTH_SUCCESS: 'authentication succeeded',
    AUTH_FAILED: 'authentication failed',
    NO_AUTH: 'User is not authenticated'
  }
};
