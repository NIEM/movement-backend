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
  let schemaExport = {
    "$schema": "http://json-schema.org/draft-04/schema#",
    "additionalProperties": false,
    "properties": {}
  };

  if (itemsToExport) {
    getElementObjects(itemsToExport);
  } else {
    returnResponse(400, 'Must specify items to export.');
  }


  function getElementObjects(elements, cb) {
    elements = elements.filter( (element) => {
      return addedItems.indexOf(element) < 0;
    });
    addedItems.push.apply(addedItems, elements);

    // TODO: Move node async with callbacks to a promise based asynchronous handling
    async.each(elements, (el, callback) => {
      let elQuery = 'id:' + el.split(':')[0] + '\\:' + el.split(':')[1];
      let elSchema = {};

      makeSolrRequest(buildQueryString(elQuery)).then( (solrResponse) => {
        let elDoc = solrResponse;
        elSchema.description = elDoc.definition;

        if (elDoc.type) {
          getTypeObject(elDoc.type).then( (typeDoc) => {
            elDoc.type = typeDoc;
            if (elDoc.type.elements) {
              elSchema.type = "object";
              elSchema.additionalProperties = false;
              elSchema.properties = {};

              elDoc.type.elements.forEach( (element) => {
                elSchema.properties[element] = {
                  "$ref": "#/properties/" + element
                };
              });

              schemaExport.properties[el] = elSchema;
              getElementObjects(elDoc.type.elements, callback);

            } else {
              elSchema.type = elDoc.type.name;
              schemaExport.properties[el] = elSchema;
              callback();
            }
          }).catch( (err) => {
            callback(err);
            return;
          });
        } else {
          schemaExport.properties[el] = elSchema;
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
        cb();
      } else {
        returnResponse(200, schemaExport);
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
