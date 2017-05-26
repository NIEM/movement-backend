'use strict';

const querystring = require('querystring');
const makeSolrRequest = require('../middleware/solrRequest');

/**
 * Returns a Promise that resolves all type Ids that are non-parents.
 */

module.exports = function getNonparentTypes() {
  return makeSolrRequest(buildQueryString()).then(typeObjects => typeObjects.map(typeObject => typeObject.id));
}

/**
 * @name buildQueryString
 * @description Stringifies an object with a query to be passed to solr. The querystring for getNonparentTypes ensures the entity is a type, has a content style (prevents strict complex types), and has no child elements.
 * @returns {String} - a stringified request object
 */
function buildQueryString() {
  return querystring.stringify({
    'q': '*:*',
    'fq': ['entityType:Type', 'contentStyle:*', '-elements:[* TO *]'],
    'rows': 10000
  });
}
