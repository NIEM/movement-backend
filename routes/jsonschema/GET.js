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
  // let respArr = [];

  if (itemsToExport) {
    getElementObjects(itemsToExport);
  } else {
    returnResponse(400, 'Must specify items to export.');
  }


  function getElementObjects(elements, cb) {
    let elArr = [];
    async.each(elements, (el, callback) => {
      let elQuery = 'id:' + el.split(':')[0] + '\\:' + el.split(':')[1];
      makeSolrRequest(buildQueryString(elQuery), (err, solrResponse) => {
        if (err) {
          callback(err);
          return;
        } else {
          el = solrResponse;
          elArr.push(el);
          if (el.type) {
            getTypeObject(el.type).then( (typeDoc) => {
              el.type = typeDoc;
              if (el.type.elements) {
                getElementObjects(el.type.elements, (err, arr) => {
                  if (err) {
                    callback(err);
                  } else {
                    el.type.elements = arr;
                    callback();
                  }
                });
              } else {
                callback();
              }
            });
          } else {
            callback();
          }
        }
      });
    }, (err) => {
      if (err) {
        cb(err);
        returnResponse(400, 'Error processing JSON Schema request.');
      } else {
        if (cb) {
          cb(null, elArr);
        } else {
          returnResponse(200, elArr);
        }
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
    makeSolrRequest(buildQueryString(typeQuery), (err, solrResponse) => {
      if (err) {
        return reject(err);
      }

      return resolve(solrResponse); 
    });
  });
}