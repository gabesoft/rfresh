var WSServer = require('ws').Server
  , http     = require('http')
  , path     = require('path')
  , express  = require('express')
  , app      = express()
  , port     = process.env.PORT || 8002;

app.use(express.logger('dev'));
app.use(express.static(path.join(__dirname, './public')));
app.use(express.bodyParser());

server = http.createServer(app);
server.listen(port, function () {
    console.log('test server started on port ' + port);
});

