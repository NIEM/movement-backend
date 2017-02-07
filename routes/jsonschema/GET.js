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
          getTypeObject(solrResponse).then( (typeDoc) => {
            solrResponse.type = typeDoc;
            respArr.push(solrResponse);
            callback();
          });
        }
      });
    }, (err) => {
      if (err) {
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

function buildQueryString(query) {
  return querystring.stringify({
    'q': query,
    'wt': 'json'
  });
}


function getElementObjects(typeDoc) {
  typeDoc.elements.forEach( (element, index, arr) => {
    let elementQuery = 'name:' + element.split(':')[1];

    makeSolrRequest(buildQueryString(elementQuery), (err, solrResponse) => {
      arr[index] = solrResponse;

      if (arr[index].type) {
        getTypeObject(arr[index]).then( (typeDoc) => {
          arr[index].type = typeDoc;
        });
      }
    });

  });
}

function getTypeObject(elementDoc) {

  let typeQuery = 'name:' + elementDoc.type.split(':')[1];
  return new Promise((resolve, reject) => {
    makeSolrRequest(buildQueryString(typeQuery), (err, solrResponse) => {
      if (err) {
        return reject(err);
      }

      return resolve(solrResponse); 
    });
  });
}