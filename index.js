'use strict';
require('dotenv').load();
require('app-module-path').addPath(__dirname + '/');

let express = require('express');
let app = express();

require('./config/conf')(app);
require('./routes')(app);

app.listen(process.env.PORT, () => {
  console.log(`Express listening on port ${process.env.PORT}`);
});
