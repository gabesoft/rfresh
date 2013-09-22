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
      , dir      = options.watchDir
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
            var data  = JSON.parse(msg);

            watched = {};
            data.forEach(function (e) {
                var path = resolver.resolvePath(e.url);
                watched[path] = e;
            });

            watcher && watcher.stop();
            watcher = new Watcher({ files: Object.keys(watched) });
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
