var WSServer = require('ws').Server
  , http     = require('http')
  , path     = require('path')
  , express  = require('express')
  , eyes     = require('eyes')
  , Resolver = require('./resolver').Resolver
  , Watcher  = require('watch-fs').Watcher;

exports.start = function(options, cb) {
    var port     = options.port
      , app      = express()
      , rewrite  = options.rewrite
      , dir      = options.dir
      , server   = null
      , resolver = new Resolver(dir, rewrite)
      , watcher  = null
      , watched  = {};

    app.use(express.logger('dev'));
    app.use(express.static(path.join(__dirname, '../public')));

    server = http.createServer(app);
    server.listen(port, cb);

    wss = new WSServer({ server: server });

    wss.on('connection', function (ws) {
        ws.on('message', function (msg) {
            var data  = JSON.parse(msg)
              , files = [];

            eyes.inspect(data);

            data.forEach(function (e) {
                e.path = resolver.resolvePath(e.url);
                watched[e.path] = e;
            });

            files = data.map(function(e) { return e.path; });
            watcher = new Watcher({ files: files });
            watcher.on('change', function (name) {
                var msg = JSON.stringify(watched[name]);
                ws.send(msg, function (err) {
                    console.log('change detected: ' + name);
                });
            });
            watcher.start(function (err) {
                if (err) {
                    console.log('failed to start watcher', err);
                } else {
                    console.log('watcher started');
                }
            });
        });
    });
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
