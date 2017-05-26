'use strict';

const fs = require('fs');
const getNonparentTypes = require('./components/getNonparentTypes');

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
