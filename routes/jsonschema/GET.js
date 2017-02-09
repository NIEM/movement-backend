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
      let idQuery = 'id:' + item.split(':')[0] + '\\:' + item.split(':')[1];
      makeSolrRequest(buildQueryString(idQuery), (err, solrResponse) => {
        if (err) {
          callback(err);
          return;
        } else {
          let itemJSON = solrResponse.docs[0];
          if (itemJSON) {
            respArr.push(itemJSON);
          }
          callback();
        }
      });
    }, (err) => {
      if (err) {
        returnResponse(400, 'Error processing JSON Schema request.');
      } else {
        res.set("Content-Disposition", "attachment;filename=data.json");
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

function buildQueryString(query) {
  return querystring.stringify({
    'q': query,
    'wt': 'json'
  });
}
