'use strict';

module.exports = makeSolrRequest;

const http = require('http');

function makeSolrRequest(query) {

  return new Promise((resolve, reject) => {

    let options = {
      hostname: 'wist-solr',
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
        if (JSON.parse(responseBody).response.docs[0]) {
          return resolve(JSON.parse(responseBody).response.docs[0]);
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
