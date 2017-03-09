'use strict';

/**
 * Map of XML to JSON types for the NIEM Model
 * @type {Object}
 */
module.exports = {
  "niem-xs:boolean": {
    "type": "boolean"
  },
  "niem-xs:gYear": {
    "type": "string"
  },
  "niem-xs:integer": {
    "type": "number"
  },
  "niem-xs:dateTime": {
    "type": "string"
  },
  "niem-xs:string": {
    "type": "string"
  },
  "niem-xs:duration": {
    "type": "string"
  },
  "niem-xs:nonNegativeInteger": {
    "type": "number",
    "minimum": "0"
  },
  "niem-xs:decimal": {
    "type": "number"
  },
  "niem-xs:anyURI": {
    "type": "string"
  },
  "niem-xs:base64Binary": {
    "type": "string"
  },
  "niem-xs:time": {
    "type": "string"
  },
  "niem-xs:date": {
    "type": "string"
  },
  "niem-xs:token": {
    "type": "string"
  },
  "niem-xs:gMonth": {
    "type": "string"
  },
  "niem-xs:hexBinary": {
    "type": "string"
  },
  "niem-xs:double": {
    "type": "number"
  },
  "niem-xs:unsignedInt": {
    "type": "number"
  },
  "niem-xs:float": {
    "type": "number"
  },
  "niem-xs:positiveInteger": {
    "type": "number",
    "minimum": "1"
  },
  "niem-xs:gYearMonth": {
    "type": "string"
  },
  "structures:ObjectType": {
    "type": "object"
  },
  "structures:SimpleObjectAttributeGroup": {
    "type": "object"
  },
  "structures:MetadataType": {
    "type": "object"
  },
  "structures:AssociationType": {
    "type": "object"
  }
};
