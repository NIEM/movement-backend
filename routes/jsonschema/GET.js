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

  if (itemsToExport) {
    getElementObjects(itemsToExport).then( () => {
      res.set('Content-Type', 'application/json; charset=utf-8');
      res.set('Content-Disposition', 'attachment;filename=data.json');
      res.status(200).send(JSON.stringify(schemaExport, null, 2));
    }).catch( (err) => {
      res.status(400).json('Error processing JSON Schema request: ', err);
    });
  } else {
    res.status(400).json('Must specify items to export.');
  }


  // For a given list of element names return their full document object and their children as derived from the type. Convert to JSON Schema format.
  function getElementObjects(elements) {

    return makeSolrRequest(buildQueryString(constructOrQuery(elements))).then( (elArr) => {
      // Filter out any elements that are not a part of the business glossary.
      elArr = elArr.filter( (elArrItem) => {
        return elArrItem.isBG;
      });

      return Promise.all(elArr.map( (item) => {
        return new Promise( (resolve, reject) => {
          // To prevent infinite recursion for circular referenced data. If item already exists in schema, just resolve it to be added a a child reference.
          if (addedItems.indexOf(item.name) < 0) {
            addedItems.push(item.name);
            generateJSONSchema(item, resolve, reject);
          } else {
            resolve();
          }
        }).then( (schema) => {
          if (schema) {
            schemaExport.properties[item.name] = schema;
          }
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
          return getElementObjects(elType.elements);
        } else {
          elSchema.type = elType.name;
          resolveCB(elSchema);         
        }
      }).then( (childElements) => {
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
