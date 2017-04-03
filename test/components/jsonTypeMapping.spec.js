'use strict';
const expect = require('chai').expect,
    locreq = require('locreq')(__dirname),
    jsonTypeMapping = locreq('components/jsonTypeMapping');

describe('JSON Type Mapping', function() {
  describe('#jsonTypeMapping()', function() {
    it('should instantiate the JSON Type Mapping', function() {
      expect(jsonTypeMapping["niem-xs:boolean"]).to.deep.equal({"type": "boolean"});
      expect(jsonTypeMapping["niem-xs:nonNegativeInteger"]).to.deep.equal({"type": "number", "minimum": "0"});
      expect(jsonTypeMapping["structures:ObjectType"]).to.deep.equal({"type": "object"});
    });
  });
});
