var WSServer = require('ws').Server
    , path     = require('path')
    , http     = require('http')
    , express  = require('express')
    , app      = express()
    , eyes     = require('eyes')
    , server   = null
    , wss      = null
    , util = require('./util')
    , argv = require('optimist')
      .usage(util.usage('Starts the rfresh server'))
      .alias('p', 'port').describe('p', 'server port (defaults to 8080)')
      .alias('d', 'dir').describe('d', 'path to the directory to watch (defaults to the current directory)')
      .alias('r', 'rewrite').describe('r', 'rewrite path in the format "regex:replacement"')
      .alias('h', 'help').describe('h', 'displays usage')
  , port = argv.port || 8080
  , dir = argv.dir || process.cwd()
  , rewrite = argv.rewrite;
//, resolver = require('resolver').Resolver(dir, rewrite)

console.log(port, dir, rewrite);

if (argv.help) {
  console.log(argv.help());
  process.exit(0);
}

//app.use(express.static(path.join(__dirname, '../public')));
//app.use(express.logger('dev'));
//app.use(express.bodyParser());

//server = http.createServer(app);
//server.listen(port, function() {
//console.log('server started on port: ' + port);
//});

//wss = new WSServer({ server: server });
//wss.on('connection', function (ws) {
//var count = 0
//, id = setInterval(function () {
//count++;
//if (count > 10) { return; }
//var data = JSON.stringify(process.memoryUsage());
//ws.send(data, function (err) {
////console.log('data sent', err);
//});
//}, 500);

//console.log('started client interval');
//ws.on('message', function (msg) {
//eyes.inspect(JSON.parse(msg));
//});

//ws.on('close', function () {
//console.log('stopping client interval');
//clearInterval(id);
//});
//});
