'use strict';

module.exports = makeSolrRequest;

const http = require('http');

/**
 * @name makeSolrRequest
 *
 * @description Makes an http GET request to Solr with a given query. When successful, will return the documents of the solr response.
 *
 * @param {String} - query
 *
 * @returns {Promise}
 */
function makeSolrRequest(query) {

  return new Promise((resolve, reject) => {

    let options = {
      hostname: 'movement-solr',
      port: 8983,
      path: '/solr/dhsniem/select?' + query,
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    };

    let req = http.request(options, (res) => {
      res.setEncoding('utf8');
      let responseBody = '';

      res.on('data', (chunk) => {
        responseBody += chunk;
      });

      res.on('end', () => {
        if (JSON.parse(responseBody).response && JSON.parse(responseBody).response.docs) {
          return resolve(JSON.parse(responseBody));
        } else {
          return reject('Error processing Solr Request');
        }
      });
    });

    req.on('error', (err) => {
      return reject(err);
    });

    req.end();
  });
}
