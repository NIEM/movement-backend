'use strict';
const makeSolrRequest = require('../../middleware/solrRequest');
const async = require('async');
const querystring = require('querystring');

/**
 * Route handler for Express
 * This returns a JSON schema from a list of NIEM items
 */
module.exports = function jsonschema(req, res, next) {

  let itemsToExport = req.query.itemsToExport;
  let respArr = [];

  if (itemsToExport) {
    async.each(itemsToExport, (item, callback) => {
      makeSolrRequest(buildQueryString(item), (err, itemJSON) => {
        if (err) {
          callback(err);
          return;
        } else if (itemJSON) {
          respArr.push(itemJSON);
          callback();
        }
      });
    }, (err) => {
      if( err ) {
        returnResponse(400, 'Error processing JSON Schema request.');
      } else {
        returnResponse(200, respArr);
      }
    });  
  } else {
    returnResponse(400, 'Must specify items to export.');
  }

  function returnResponse(status, data) {
    return res.status(status).json(data);
  }

};

function buildQueryString(item) {
  return querystring.stringify({
    'q': 'name:' + item,
    'wt': 'json'
  });
}
