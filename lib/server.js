var WSServer   = require('ws').Server
  , fs         = require('fs')
  , http       = require('http')
  , path       = require('path')
  , handlebars = require('handlebars')
  , express    = require('express')
  , Resolver   = require('./resolver').Resolver
  , Watcher = require('watch-fs').Watcher;

require('colors');

exports.start = function(options, cb) {
    var port     = options.port
      , app      = express()
      , rewrite  = options.rewrite
      , dir      = options.watchDir
      , server   = null
      , uniqueId = 1
      , resolver = new Resolver(dir, rewrite)
      , watchers = {};

    app.use(express.logger('dev'));
    app.get('/rfresh-client.js', function (req, res) {
        var file = path.join(__dirname, '../client/rfresh-client.js');

        fs.readFile(file, function (err, data) {
            var templ = handlebars.compile(data.toString('utf8'));
            res.type('application/javascript');
            res.end(templ(options));
        });
    });

    server = http.createServer(app);
    server.listen(port, cb);

    wss = new WSServer({ server: server });

    wss.on('connection', function (ws) {
        var clientId = ++uniqueId;

        function closeWatcher () {
            if (watchers[clientId]) {
                watchers[clientId].stop();
                watchers[clientId] = null;
            }
        }

        function log () {
            var args = Array.prototype.slice.call(arguments)
              , msg  = ('client #' + clientId).grey + ' ' + args[0]
              , rest = args.slice(1);
            console.log.apply(console, [msg].concat(rest));
        }

        ws.on('open', function () {
            log('connected');
        });

        ws.on('message', function (msg) {
            var data  = JSON.parse(msg),
                paths = [],
                items = {};

            closeWatcher();

            data.forEach(function (e) {
                var path = resolver.resolvePath(e.url);

                if (fs.existsSync(path)) {
                    items[path] = e;
                } else {
                    log('file not found '.yellow + path.green);
                }
            });

            paths = Object.keys(items);

            watchers[clientId] = new Watcher({ paths: paths });
            watchers[clientId].on('change', function (name) {
                var msg = null;
                if (!items[name]) {
                    log('no client data found for ' + name.red);
                } else {
                    msg = JSON.stringify(items[name]);
                    ws.send(msg, function (err) {
                        log('change detected ' + name.green);
                    });
                }
            });

            watchers[clientId].start(function (err, failed) {
                if (err) {
                    log('failed to start watcher'.red);
                    console.log(err.stack || err);
                    return;
                } else {
                    log('watcher started');
                    log('watching ' + String(paths.length).yellow + ' files');
                }

                if (failed.length > 0) {
                    log('failed to watch ' + String(failed.length).red + ' files');
                    console.log(failed);
                }
            });
        });

        ws.on('close', function () {
            log('disconnected');
            closeWatcher();
        });

        ws.on('error', function (err) {
            log('error'.red);
            console.log(err.stack || err);
        });
    });
};
