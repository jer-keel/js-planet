// Require plugins
var express = require('express');
    app     = express();
    http    = require('http');
    path    = require('path');

var defaultPort = 80;

// Express configuration
app.use(express.static(path.resolve('public')));

// Routes
var router = express.Router();

router.get('/', function(req, res, next) {
  res.sendFile(path.resolve('./public/index.html'));
});

app.use('/', router);

// Start server
var server = http.createServer(app);
server.listen(process.env.PORT || defaultPort, process.env.IP || '0.0.0.0', function() {
  var address = server.address();
  console.log('Server is now started on ', address.address + ':' + address.port);
});
