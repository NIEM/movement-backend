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
          return generateJSONSchema(item).then( (schema) => {
            schemaExport.properties[item.id] = schema;
            return item.id;            
          });
        } else {
          return item.id;
        }

      }));

    });
  }


  function generateJSONSchema(el) {
    let elSchema = {};
    let properties;
    elSchema.namespace = el.namespace;
    elSchema.namespacePrefix = el.namespacePrefix;
    elSchema.description = el.definition;

    if (el.type) {
      return getDocById(el.type).then( (elType) => {
        let requests = [];

        if (elType.parentSimpleType) {
          requests.push(getDocById(elType.parentSimpleType).then( (simpleTypeDoc) => {
            if (simpleTypeDoc && simpleTypeDoc.facets) {
              elSchema.enum = getEnumFromSimpleType(simpleTypeDoc);
            }
          }));
        }

        // if (elType.parentTypeName) {
        //   requests.push(getDocById(elType.parentTypeName).then( (parentTypeDoc) => {
        //     return parentTypeDoc.elements ? parentTypeDoc.elements : [];
        //   }).then( (elements) => {
        //     if (elements) {
        //       console.log(elements);
        //       return getElementObjects(elements).then( (childElements) => {
        //         elSchema.allOf = setInheritanceReferences(childElements);
        //       });
        //     }
        //   }));
        // }

        if (elType.elements) {
          elSchema.type = "object";
          requests.push(getElementObjects(elType.elements).then( (childElements) => {
            properties = setChildReferences(childElements);
          }));
        } else {
          elSchema.type = elType.name;
        }

        return Promise.all(requests);

      }).then( () => {
        if (elSchema.allOf) {
          elSchema.allOf.push({"properties": properties});
        } else if (properties) {
          elSchema.properties = properties;
        }
        return elSchema;
      });
    } else {
      // return elSchema;
      return new Promise( (resolve) => {
        return resolve(elSchema);
      });
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


function setInheritanceReferences(elements) {
  let allOf = [];
  elements.forEach( (element) => {
    allOf.push(createReference(element));
  });
  return allOf;
}


function createReference(element) {
  return {
    "$ref": "#/properties/" + element
  };
}
