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
  let addedItems = [];

  if (itemsToExport) {
    getElementObjects(itemsToExport);
  } else {
    returnResponse(400, 'Must specify items to export.');
  }


  function getElementObjects(elements, cb) {
    let elArr = [];
    async.each(elements, (el, callback) => {
      let elQuery = 'id:' + el.split(':')[0] + '\\:' + el.split(':')[1];
      makeSolrRequest(buildQueryString(elQuery)).then( (solrResponse) => {
        let elDoc = solrResponse;
        elArr.push(elDoc);
        if (elDoc.type) {
          getTypeObject(elDoc.type).then( (typeDoc) => {
            elDoc.type = typeDoc;
            if (elDoc.type.elements) {
              getElementObjects(elDoc.type.elements, (arr) => {
                elDoc.type.elements = arr;
                callback();
              });
            } else {
              callback();
            }
          }).catch( (err) => {
            callback(err);
          });
        } else {
          callback();
        }
      }).catch( (err) => {
        callback(err);
        return;
      });
    }, (err) => {
      if (err) {
        returnResponse(400, 'Error processing JSON Schema request.');
      } else if (cb) {
        cb(elArr);
      } else {
        returnResponse(200, elArr);
      }
    });
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


function getTypeObject(typeName) {
  let typeQuery = 'name:' + typeName.split(':')[1];
  return new Promise((resolve, reject) => {
    makeSolrRequest(buildQueryString(typeQuery)).then( (solrResponse) => {
      return resolve(solrResponse);
    }).catch( (err) => {
      return reject(err);
    });
  });
}
