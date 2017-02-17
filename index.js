'use strict';
require('dotenv').load();
require('app-module-path').addPath(__dirname + '/');

let express = require('express');
let app = express();
let mongoConnection = require('components/mongoConnection');

require('./config/conf')(app);
require('./config/session')(app);
require('./config/passport')(app);

require('./routes')(app);

mongoConnection(process.env.MONGO_CONNECTION_STRING).then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`Express listening on port ${process.env.PORT}`);
  });
})
.catch((err) => {
  console.log(err);
});

if(process.env.NODE_ENV === 'development') {
  require('./documentation');
  app.use('/doc', express.static('out'));
}
