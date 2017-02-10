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

  // Validate that there are items to export from teh request query parameter
  if (itemsToExport) {
    getElementObjects(itemsToExport);
  } else {
    returnResponse(400, 'Must specify items to export.');
  }

  // TODO: Move node async with callbacks to a promise based asynchronous handling
  // For a given list of element names return their full document object and their children as derived from the type. Convert to JSON Schema format.
  function getElementObjects(elements, cb, parent) {

    // Filter out any elements who have already been added to the schema. Prevents infinite recursion caused by circular references in the data. 
    elements = elements.filter( (element) => {
      return addedItems.indexOf(element) < 0;
    });
    addedItems.push.apply(addedItems, elements);

    // Pass in array of element names to return array of element documents.
    makeSolrRequest(buildQueryString(constructOrQuery(elements))).then( (elArr) => {

      // Filter out any elements that are not a part of the business glossary.
      elArr = elArr.filter( (elArrItem) => {
        return elArrItem.isBG;
      });


      // For valid elements, asynchronously make the request to recurse each. When done processing all requests in array, return the response; or call up the tree.
      async.each(elArr, (el, callback) => {

        // Add this BG element to the parent now that we have confirmed that is in fact BG
        if (parent) {
          schemaExport.properties[parent].properties[el.name] = {
            "$ref": "#/properties/" + el.name
          };
        }

        // Start building out the JSON schema for the current element.
        let elSchema = {};
        elSchema.description = el.definition;

        // If the element has a type defined, grab the type's full document object.
        if (el.type) {
          getTypeObject(el.type).then( (elType) => {
            // If the type object contains child elements, add the references 
            if (elType.elements) {
              elSchema.type = "object";
              elSchema.properties = {};


              schemaExport.properties[el.name] = elSchema;
              getElementObjects(elType.elements, callback, el.name);
          
            } else {
              elSchema.type = elType.name;
              schemaExport.properties[el.name] = elSchema;
              callback();
            }
          }).catch( (err) => {
            callback(err);
            return;
          });
        } else {
          schemaExport.properties[el.name] = elSchema;
          callback();
        }
      }, (err) => {
        if (err) {
          returnResponse(400, 'Error processing JSON Schema request.');
        } else if (cb) {
          cb();
        } else {
          returnResponse(200, schemaExport);
        }
      });
    }).catch( (err) => {
      returnResponse(400, 'Error processing Solr request.');
    });
  }

  function returnResponse(status, data) {
    return res.status(status).json(data);
  }

};

function constructOrQuery(itemArr) {
  let orQueryString = itemArr.map( (item) => {
    return item.split(':')[0] + '\\:' + item.split(':')[1];
  }).join(' OR ');

  return 'id:(' + orQueryString + ')';
}

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
      return resolve(solrResponse[0]);
    }).catch( (err) => {
      return reject(err);
    });
  });
}
