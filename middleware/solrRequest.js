'use strict';

module.exports = makeSolrRequest;

const http = require('http');

function makeSolrRequest(query, callback) {

  let options = {
    hostname: '192.168.99.100',
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

    // Callback with error if no docs found or other errors. Otherwise send over the first doc found.
    res.on('end', () => {
      if (!JSON.parse(responseBody).response.docs[0]) {
        callback(JSON.parse(responseBody).response);
      } else if (res.statusCode === 200 || res.statusCode === 201 ) {
        callback(null, JSON.parse(responseBody).response.docs[0]);
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
