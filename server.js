const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const env = require('./config/prod.env');

const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(`${env.APP_PREFIX}/`, express.static(path.join(__dirname, '/dist')));

app.listen(5000, function() {
  console.log('Express server listening on port 5000');
});

