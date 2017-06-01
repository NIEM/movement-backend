'use strict';

const querystring = require('querystring');
const makeSolrRequest = require('../middleware/solrRequest');

/**
 * Returns a Promise that resolves all element Ids that are substitution group headers
 */

module.exports = function getSubGroupHeaders() {
  return getFacetsFromSolr(buildQueryString()).then(facetFieldObjects => Object.keys(facetFieldObjects.substitutionGroup));
}

/**
 * @name getFacetsFromSolr
 * @description Parses the solr response to only return the facet fields object
 * @param {String} - a stringified request object
 * @returns {Promise}
 */
function getFacetsFromSolr(query) {
  return makeSolrRequest(query).then(responseBody => responseBody.facet_counts.facet_fields);
}

/**
 * @name buildQueryString
 * @description Stringifies an object with a query to be passed to solr. The querystring for getSubGroupHeaders ensures that the returned facets are heads only for business glossary elements, have at least one facet, and sets the max above a reasonable number of sub group heads.
 * @returns {String} - a stringified request object
 */
function buildQueryString() {
  return querystring.stringify({
    'q': '*:*',
    'fq': 'isBG:1',
    'facet.field': 'substitutionGroup',
    'facet': 'on',
    'facet.limit': 1000,
    'facet.mincount': 1,
    'json.nl': 'map'
  });
}
