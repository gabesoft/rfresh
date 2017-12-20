const WSServer   = require('ws').Server;
const http       = require('http');
const path       = require('path');
const express    = require('express');
const app        = express();
const morgan     = require('morgan');
const port       = process.env.PORT || 8002;
const bodyParser = require('body-parser');

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, './public')));
app.use(bodyParser.text({ type: 'text/html' }));

server = http.createServer(app);
server.listen(port, function () {
  console.log('test server started on port ' + port);
});
