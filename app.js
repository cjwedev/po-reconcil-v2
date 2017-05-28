
/**
 * Module dependencies
 */

var express = require('express'),
  bodyParser = require('body-parser'),
  methodOverride = require('method-override'),
  api = require('./routes/api'),
  config = require('./config');
  http = require('http'),
  path = require('path');

var app = module.exports = express();

/**
 * Configuration
 */

// all environments
app.set('port', process.env.PORT || config.express.port_num);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(require('morgan')("combined"));

var env = process.env.NODE_ENV || 'local';

/**
 * Routes
 */

// JSON API
app.post('/api/send', api.send);

// redirect all others to the index (HTML5 history)
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});


/**
 * Start Server
 */

http.createServer(app).listen(app.get('port'), function (error) {
  if (error) {
    console.log(error);
  }
  console.log('Express server listening on port ' + app.get('port'));
});
