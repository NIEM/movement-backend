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
    "properties": {}
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


  // For a given list of element names return their full document object and their children as derived from the type. Convert to JSON Schema format.
  function getElementObjects(elements) {

    return makeSolrRequest(buildQueryString(constructOrQuery(elements))).then( (elementDocs) => {
      // Filter out any elements that are not a part of the business glossary.
      elementDocs = elementDocs.filter( (elementDoc) => {
        return elementDoc.isBG;
      });

      return Promise.all(elementDocs.map( (elementDoc) => {

        if (elementDoc.type && !jsonTypeMapping[elementDoc.type] && addedItems.indexOf(elementDoc.type) < 0) {
          addedItems.push(elementDoc.id, elementDoc.type);
          schemaExport.properties[elementDoc.id] = generateElementSchema(elementDoc);
          return getDocById(elementDoc.type).then( (typeDoc) => {
            return generateTypeSchema(typeDoc);
          }).then( (typeSchema) => {
            schemaExport.properties[elementDoc.type] = typeSchema;
            return elementDoc.id;
          });

        } else if (addedItems.indexOf(elementDoc.id) < 0) {
          addedItems.push(elementDoc.id);
          schemaExport.properties[elementDoc.id] = generateElementSchema(elementDoc);
          return getSubstitutionGroups(elementDoc.id).then( (subGroupsRefs) => {
            schemaExport.properties[elementDoc.id].anyOf = subGroupsRefs;
          }).then( () => {
            return elementDoc.id;
          });

        } else {
          return elementDoc.id;
        }

      }));

    });
  }


  function generateTypeSchema(typeDoc) {
    let typeSchema = getBasicAttributes(typeDoc);
    let properties;
    let requests = [];

    if (typeDoc.parentSimpleType) {
      getParentType(typeDoc.parentSimpleType);
    }

    if (typeDoc.parentTypeName) {
      getParentType(typeDoc.parentTypeName);
    }

    if (typeDoc.elements) {
      requests.push(getElementObjects(typeDoc.elements).then( (childElements) => {
        properties = setRefsInObject(childElements);
      }));
    }

    if (typeDoc.facets) {
      typeSchema.enum = getEnumFromSimpleType(typeDoc);
    }

    return Promise.all(requests).then( () => {
      if (typeSchema.allOf && properties) {
        typeSchema.allOf.push({"properties": properties});
      } else if (properties && Object.keys(properties).length) {
        typeSchema.properties = properties;
      }

      return typeSchema;
    });

    function getParentType(parentTypeId) {
      if (jsonTypeMapping[parentTypeId]) {
        Object.assign(typeSchema, jsonTypeMapping[parentTypeId]);
      } else {
        requests.push(getDocById(parentTypeId).then( (parentTypeDoc) => {
          if (parentTypeDoc) {
            typeSchema.allOf = [createReference(parentTypeDoc.id)];
            return generateTypeSchema(parentTypeDoc);
          }
        }).then( (parentTypeSchema) => {
          schemaExport.properties[parentTypeId] = parentTypeSchema;
        }));      
      }
    }
  }


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


function constructOrQuery(itemArr) {
  let orQueryString = itemArr.map( (item) => {
    return item.split(':')[0] + '\\:' + item.split(':')[1];
  }).join(' OR ');
  return 'id:(' + orQueryString + ')';
}


function buildQueryString(query) {
  return querystring.stringify({
    'q': query
  });
}


function getDocById(id) {
  let idQuery = 'id:' + id.split(':')[0] + '\\:' + id.split(':')[1];
  return makeSolrRequest(buildQueryString(idQuery)).then( (solrResponse) => {
    return solrResponse[0];
  });
}


function getEnumFromSimpleType(simpleTypeDoc) {
  let enumeration;
  simpleTypeDoc.facets.forEach( (facet) => {
    if (JSON.parse(facet).enumeration) {
      enumeration = JSON.parse(facet).enumeration.facetValue;
      return;
    }
  });
  return enumeration;
}


function setRefsInObject(elements) {
  let refs = {};
  elements.forEach( (el) => {
    refs[el] = createReference(el);
  });
  return refs;
}


function setRefsInArray(elements) {
  let refs = [];
  elements.forEach( (el) => {
    refs.push(createReference(el));
  });
  return refs;
}


function createReference(entity) {
  return {
    "$ref": "#/properties/" + entity
  };
}


function getBasicAttributes(entity) {
  return {
    namespace: entity.namespace,
    namespacePrefix: entity.namespacePrefix,
    description: entity.definition    
  };
}


function generateElementSchema(elementDoc) {
  let elSchema = getBasicAttributes(elementDoc);
  if (elementDoc.type) {
    if (jsonTypeMapping[elementDoc.type]) {
      Object.assign(elSchema, jsonTypeMapping[elementDoc.type]);
    } else {
      elSchema.$ref = "#/properties/" + elementDoc.type;
    }
  }
  return elSchema;
}
