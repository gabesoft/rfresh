var WSServer = require('ws').Server
  , http     = require('http')
  , path     = require('path')
  , express  = require('express')
  , eyes     = require('eyes')
  , Resolver = require('./resolver').Resolver
  , Watcher  = require('watchfs').Watcher;

exports.start = function(options, cb) {
    var port     = port
      , app      = express()
      , rewrite  = options.rewrite
      , dir      = options.dir
      , server   = null
      , resolver = new Resolver(dir, rewrite)
      , watcher  = null
      , watched  = {};

    app.use(express.static(path.join(__dirname, '../public')));
    app.use(express.logger('dev'));
    app.use(express.bodyParser());

    server = http.createServer(app);
    server.listen(port, cb);

    //wss = new WSServer({ server: server });

    //wss.on('connection', function (ws) {
        //ws.on('message', function (msg) {
            //var data  = JSON.parse(msg);

            //data.forEach(function (e) {
                //e.path = resolver.resolvePath(e.url);
                //watched[e.path] = e;
            //});

            //watcher = new Watcher(data.map(function(e) { return e.path; }));
            //watcher.on('change', function (name) {
                //var msg = JSON.stringify(watched[name]);
                //watcher.send(msg, function (err) {
                    //console.log('change detected: ' + name);
                //});
            //});
        //});
    //});
};

// TODO: verify dir



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
