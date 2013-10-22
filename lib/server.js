var WSServer   = require('ws').Server
  , fs         = require('fs')
  , http       = require('http')
  , path       = require('path')
  , handlebars = require('handlebars')
  , express    = require('express')
  , Resolver   = require('./resolver').Resolver
  , Gaze       = require('gaze').Gaze;

require('colors');

exports.start = function(options, cb) {
    var port     = options.port
      , app      = express()
      , rewrite  = options.rewrite
      , dir      = options.watchDir
      , server   = null
      , uniqueId = 1
      , resolver = new Resolver(dir, rewrite)
      , watchers = {}
      , watched  = {};

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
                watchers[clientId].close();
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
            var data  = JSON.parse(msg);

            watched = {};
            data.forEach(function (e) {
                var path = resolver.resolvePath(e.url);
                if (fs.existsSync(path)) {
                    watched[path] = e;
                } else {
                    log('file not found '.yellow + path.green);
                }
            });

            closeWatcher();

            watchers[clientId] = new Gaze(Object.keys(watched), null, function (err) {
                if (err) {
                    log('failed to start watcher'.red);
                    console.log(err.stack || err);
                    return;
                } else {
                    log('watcher started');
                }
                this.on('changed', function (name) {
                    var msg = JSON.stringify(watched[name]);
                    ws.send(msg, function (err) {
                        log('change detected ' + name.green);
                    });
                });
                this.on('error', function (err) {
                    log('watch error'.red);
                    console.log(err.stack || err);
                });
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
