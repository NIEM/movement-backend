'use strict';

module.exports = makeSolrRequest;

const http = require('http');

function makeSolrRequest(query, callback) {

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
      if (res.statusCode === 200 || res.statusCode === 201 ) {
        callback(null, JSON.parse(responseBody).response);
      } else {
        callback(res.statusCode);
        console.log('Server status error: ', res.statusCode);
      }
      
    });

  });

  req.on('error', (err) => {
    callback(err.message);
    console.log(`${err.message}`);
  });

  req.end();
}
