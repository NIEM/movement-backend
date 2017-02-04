'use strict';

module.exports = makeSolrRequest;

const http = require('http');

function makeSolrRequest(query, callback) {

  var options = {
    hostname: '192.168.99.101',
    port: 8983,
    path: '/solr/dhsniem/select?' + query,
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  };

  var req = http.request(options, (res) => {

    res.setEncoding('utf8');
    var responseBody = '';

    res.on('data', (chunk) => {
      responseBody += chunk;
    });

    res.on('end', () => {
      if (res.statusCode === 200 || res.statusCode === 201) {
        callback(null, JSON.parse(responseBody).response.docs[0]);
      } else {
        console.log('Server status error: ', res.statusCode);
      }
      
    });

  });

  req.on('error', (err) => {
    console.log(`${err.message}`);
  });

  req.end();
}
