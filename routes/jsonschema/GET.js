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
      // res.set('Content-Type', 'application/json; charset=utf-8');
      // res.set('Content-Disposition', 'attachment;filename=data.json');
      res.status(200).send(JSON.stringify(schemaExport, null, 2));
    }).catch( (err) => {
      res.status(400).json('Error processing JSON Schema request: ' + err);
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
        if (addedItems.indexOf(item.id) < 0) {
          addedItems.push(item.id);
          return generateElementSchema(item).then( (typeSchema) => {
            if (typeSchema) {
              schemaExport.properties[typeSchema.id] = typeSchema.schema;
            }
            return item.id;            
          });
        } else {
          return item.id;
        }

      }));

    });
  }


  function generateElementSchema(elementDoc) {
    let elSchema = getBasicAttributes(elementDoc);

    if (addedItems.indexOf(elementDoc.type) > 0 && elementDoc.type) {
      elSchema.allOf = [createReference(elementDoc.type)];
      schemaExport.properties[elementDoc.id] = elSchema;
      return new Promise( (resolve) => {
        return resolve();
      });
    }
    else if (elementDoc.type) {
      elSchema.allOf = [createReference(elementDoc.type)];
      schemaExport.properties[elementDoc.id] = elSchema;
      return getDocById(elementDoc.type).then( (typeDoc) => {
        return generateTypeSchema(typeDoc);
      });
    } else {
      return new Promise( (resolve) => {
        return resolve();
      });
    }
  }


  function generateTypeSchema(typeDoc) {
    let typeSchema = getBasicAttributes(typeDoc);
    let properties;
    let requests = [];

    if (typeDoc.parentSimpleType) {
      requests.push(getDocById(typeDoc.parentSimpleType).then( (simpleTypeDoc) => {
        if (simpleTypeDoc && simpleTypeDoc.facets) {
          typeSchema.enum = getEnumFromSimpleType(simpleTypeDoc);
        }
      }));
    }

    if (typeDoc.parentTypeName) {
      requests.push(getDocById(typeDoc.parentTypeName).then( (parentTypeDoc) => {
        typeSchema.allOf = [createReference(parentTypeDoc.id)];
        return generateTypeSchema(parentTypeDoc);
      }));
    }

    if (typeDoc.elements) {
      typeSchema.type = "object";
      requests.push(getElementObjects(typeDoc.elements).then( (childElements) => {
        properties = setChildReferences(childElements);
      }));
    } else {
      typeSchema.type = typeDoc.name;
    }

    return Promise.all(requests).then( () => {
      if (typeSchema.allOf) {
        typeSchema.allOf.push({"properties": properties});
      } else if (properties) {
        typeSchema.properties = properties;
      }
      return {
        'id': typeDoc.id,
        'schema': typeSchema
      };
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
    'q': query,
    'wt': 'json'
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


function setChildReferences(childElements) {
  let refs = {};
  childElements.forEach( (child) => {
    refs[child] = createReference(child);
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
