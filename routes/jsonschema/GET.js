'use strict';
const makeSolrRequest = require('../../middleware/solrRequest');
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
    getElementObjects(itemsToExport).then( () => {
      res.status(200).json(schemaExport);
    }).catch( (err) => {
      res.status(400).json('Error processing JSON Schema request: ', err);
    });
  } else {
    res.status(400).json('Must specify items to export.');
  }

  // For a given list of element names return their full document object and their children as derived from the type. Convert to JSON Schema format.
  function getElementObjects(elements) {

    // Filter out any elements who have already been added to the schema. Prevents infinite recursion caused by circular references in the data. 
    elements = elements.filter( (element) => {
      return addedItems.indexOf(element) < 0;
    });
    addedItems.push.apply(addedItems, elements);

    return makeSolrRequest(buildQueryString(constructOrQuery(elements))).then( (elArr) => {
      // Filter out any elements that are not a part of the business glossary.
      elArr = elArr.filter( (elArrItem) => {
        return elArrItem.isBG;
      });

      return Promise.all(elArr.map( (item) => {
        return new Promise( (resolve, reject) => {
          generateJSONSchema(item, resolve, reject);
        }).then( (schema) => {
          schemaExport.properties[item.name] = schema;
          return item.name;
        });
      }));

    });
  }

  function generateJSONSchema(el, resolveCB, rejectCB) {
    let elSchema = {};
    elSchema.description = el.definition;

    if (el.type) {
      getTypeObject(el.type).then( (elType) => {
        if (elType.elements) {
          elSchema.type = "object";
          elSchema.properties = {};

          getElementObjects(elType.elements).then( (childElements) => {

            childElements.forEach( (child) => {
              elSchema.properties[child] = {
                "$ref": "#/properties/" + child
              };
            });
            
            resolveCB(elSchema);

          }).catch( (err) => {
            rejectCB(err);
          });
      
        } else {
          elSchema.type = elType.name;
          resolveCB(elSchema);
        }
      }).catch( (err) => {
        rejectCB(err);
      });
    } else {
      resolveCB(elSchema);
    }
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
  return new Promise( (resolve, reject) => {
    makeSolrRequest(buildQueryString(typeQuery)).then( (solrResponse) => {
      return resolve(solrResponse[0]);
    }).catch( (err) => {
      return reject(err);
    });
  });
}
