'use strict';
const expect = require('chai').expect,
    locreq = require('locreq')(__dirname),
    jsonTypeMapping = locreq('components/jsonTypeMapping');

describe('JSON Type Mapping', function() {
  describe('jsonTypeMapping', function() {
    it('should instantiate the JSON Type Mapping', function() {
      expect(jsonTypeMapping["niem-xs:boolean"]).to.equal({"type": "boolean"});
      expect(jsonTypeMapping["niem-xs:nonNegativeInteger"]).to.equal({"type": "number", "minimum": "0"});
      expect(jsonTypeMapping["structures:ObjectType"]).to.equal({"type": "object"});
    });
  });
});
