'use strict';
const makeSolrRequest = require('../../middleware/solrRequest');
const querystring = require('querystring');
const jsonTypeMapping = require('../../components/jsonTypeMapping');

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
    "properties": {},
    "definitions": {}
  };

  if (itemsToExport) {
    getElementObjects(itemsToExport).then( () => {
      res.set('Content-Type', 'application/json; charset=utf-8');
      res.set('Content-Disposition', 'attachment;filename=data.json');
      res.status(200).send(JSON.stringify(schemaExport, null, 2));
    }).catch( (err) => {
      res.status(400).json('Error processing JSON Schema request: ' + err);
    });
  } else {
    res.status(400).json('Must specify items to export.');
  }


  /**
   * @name getElementObjects
   *
   * @description For a given list of element names, return their full document object and their children as derived from the type. Convert to JSON Schema format.
   *
   * @param [String] - elements
   *
   * @returns {Promise}
   */
  function getElementObjects(elementIds) {

    return makeSolrRequest(buildQueryString(constructOrQuery(elementIds))).then( (elementObjects) => {
      // Filter out any elements that are not a part of the business glossary.
      elementObjects = elementObjects.filter( (elementDoc) => {
        return elementDoc.isBG;
      });

      return Promise.all(elementObjects.map( (elementObject) => {
        // If the element has a type, isn't a primitive element, and hasn't been added to our schema yet
        if (elementObject.type && !jsonTypeMapping[elementObject.type] && addedItems.indexOf(elementObject.type) < 0) {
          addedItems.push(elementObject.id, elementObject.type); // add the element and its type to the tracker
          schemaExport.properties[elementObject.id] = generateElementSchema(elementObject);
          return getDocById(elementObject.type).then( (typeDoc) => {
            return generateTypeSchema(typeDoc);
          }).then( (typeSchema) => {
            schemaExport.definitions[elementObject.type] = typeSchema;
            return elementObject.id;
          });
        // Else if element has not been added to our schema
        } else if (addedItems.indexOf(elementObject.id) < 0) {
          addedItems.push(elementObject.id);
          schemaExport.properties[elementObject.id] = generateElementSchema(elementObject);
          return getSubstitutionGroups(elementObject.id).then( (subGroupsRefs) => {
            schemaExport.properties[elementObject.id].anyOf = subGroupsRefs;
          }).then( () => {
            return elementObject.id;
          });
        // Else element exists in schema, so just return its id
        } else {
          return elementObject.id;
        }

      }));

    });
  }

  /**
   * @name generateTypeSchema
   *
   * @description For a type entity (type document), generate and add the JSON schema to the output. Accounts for basic properties, simple tpyes, parent/base types, child elements, and enumeration facets. Processes requests in parallel when possible.
   *
   * @param {Object} - typeDoc
   *
   * @returns {Promise}
   */
  function generateTypeSchema(typeDoc) {
    let typeSchema = getBasicAttributes(typeDoc);
    let properties;
    let requests = [];

    if (typeDoc.parentSimpleType) {
      getParentType(typeDoc.parentSimpleType);
    }

    if (typeDoc.enumValues) {
      typeSchema.enum = typeDoc.enumValues;
    }

    return Promise.all(requests).then( () => {
      if (typeSchema.allOf && properties) {
        typeSchema.allOf.push({"properties": properties});
      } else if (properties && Object.keys(properties).length) {
        typeSchema.properties = properties;
      }

      return typeSchema;
    });


  /**
   * @name getParentType
   *
   * @description A recursive function that makes solr call to retrieve the full parent document from a base type or simple type reference. Upon retrieving the document, generates the json schema for that parent type.
   *
   * @param {String} - parentTypeId
   *
   * @returns {Promise}
   */
    function getParentType(parentTypeId) {
      if (jsonTypeMapping[parentTypeId]) {
        Object.assign(typeSchema, jsonTypeMapping[parentTypeId]);
      } else {
        requests.push(getDocById(parentTypeId).then( (parentTypeDoc) => {
          if (parentTypeDoc) {
            typeSchema.allOf = [createDefinitionRef(parentTypeDoc.id)];
            return generateTypeSchema(parentTypeDoc);
          }
        }).then( (parentTypeSchema) => {
          schemaExport.definitions[parentTypeId] = parentTypeSchema;
        }));
      }
    }
  }


  /**
   * @name getSubstitutionGroups
   *
   * @description For a given element id, checks to see if substitution groups exist for it. If subsitution groups are found, it calls the getElementObjects function to start a new branch for that particular referenced element.
   *
   * @param {String} - elementId
   *
   * @returns {Promise}
   */
  function getSubstitutionGroups(elementId) {
    let sgQuery = 'substitutionGroup:' + elementId.split(':')[0] + '\\:' + elementId.split(':')[1];
    return makeSolrRequest(buildQueryString(sgQuery)).then( (subGroups) => {
      if (subGroups) {
        return getElementObjects(subGroups.map( (subGroupElement) => {
          return subGroupElement.id;
        })).then( (subGroupElements) => {
          return setRefsInArray(subGroupElements);
        });
      }
    }).catch( (err) => {
      return;
    });
  }

};


/**
 * @name constructOrQuery
 *
 * @description For an array of ids, concatenates them into a query readable by solr.
 *
 * @param [String] - itemArr
 *
 * @returns {String} - formatted with 'id:(...)'
 */
function constructOrQuery(itemArr) {
  let orQueryString = itemArr.map( (item) => {
    return item.split(':')[0] + '\\:' + item.split(':')[1];
  }).join(' OR ');
  return 'id:(' + orQueryString + ')';
}


/**
 * @name buildQueryString
 *
 * @description Stringifies an object with a query to be passed to solr
 *
 * @param {String} - query
 *
 * @returns {String} - a stringified request object
 */
function buildQueryString(query) {
  return querystring.stringify({
    'q': query
  });
}


/**
 * @name getDocById
 *
 * @description Makes a solr request to get a document by its entity id.
 *
 * @param {String} - id
 *
 * @returns {Promise}
 */
function getDocById(id) {
  let idQuery = 'id:' + id.split(':')[0] + '\\:' + id.split(':')[1];
  return makeSolrRequest(buildQueryString(idQuery)).then( (solrResponse) => {
    return solrResponse[0];
  });
}


/**
 * @name setRefsInArray
 *
 * @description When generating a list of json schema refs, sets them as key value pairs in an object.
 *
 * @param [String] - elements
 *
 * @returns [{Object}] - an array of object references for the json schema
 */
function setRefsInArray(elements) {
  let refs = [];
  elements.forEach( (el) => {
    refs.push(createPropertyRef(el));
  });
  return refs;
}


/**
 * @name createPropertyRef
 *
 * @description Formats a reference into standard json schema syntax for a property ref
 *
 * @param {String} - entity
 *
 * @returns {Object}
 */
function createPropertyRef(entity) {
  return {
    "$ref": "#/properties/" + entity
  };
}


/**
 * @name createDefinitionRef
 *
 * @description Formats a reference into standard json schema syntax for a definition ref
 *
 * @param {String} - entity
 *
 * @returns {Object}
 */
function createDefinitionRef(entity) {
  return {
    "$ref": "#/definitions/" + entity
  };
}


/**
 * @name getBasicAttributes
 *
 * @description For an entity, will begin to build out the json schema object with basic properties such as description.
 *
 * @param {String} - entity
 *
 * @returns {Object}
 */
function getBasicAttributes(entity) {
  return {
    description: entity.definition
  };
}


/**
 * @name generateElementSchema
 *
 * @description Generates json schema output for an element, including the type reference.
 *
 * @param {Object} - elementDoc
 *
 * @returns {Object}
 */
function generateElementSchema(elementDoc) {
  let elSchema = getBasicAttributes(elementDoc);
  if (elementDoc.type) {
    if (jsonTypeMapping[elementDoc.type]) {
      Object.assign(elSchema, jsonTypeMapping[elementDoc.type]);
    } else {
      elSchema.$ref = "#/definitions/" + elementDoc.type;
    }
  }
  return elSchema;
}
