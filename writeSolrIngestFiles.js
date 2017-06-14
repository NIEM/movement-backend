/*
* Writes files for the Solr ingest. Generates two files. One that includes a list of all non-parent types in the NIEM dictionary. The second includes a list of all substitution group heads in the dictionary.
*/
'use strict';

const fs = require('fs');
const getNonparentTypes = require('./components/getNonparentTypes');
const getSubGroupHeaders = require('./components/getSubGroupHeaders');

getNonparentTypes()
.then(nonParentTypeIds => {
  fs.writeFile('nonparentTypes.json', JSON.stringify(nonParentTypeIds), err => {
    if (err) {
      console.log(err);
    }
  })
})
.catch(err => {
  console.log(err);
});

getSubGroupHeaders()
.then(subGroupHeadIds => {
  fs.writeFile('solrIngestData/subGroupHeaders.json', JSON.stringify(subGroupHeadIds), err => {
    if (err) {
      console.log(err);
    }
  })
})
.catch(err => {
  console.log(err);
});
