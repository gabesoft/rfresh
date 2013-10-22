var WSServer   = require('ws').Server
  , fs         = require('fs')
  , http       = require('http')
  , path       = require('path')
  , handlebars = require('handlebars')
  , express    = require('express')
  , Resolver   = require('./resolver').Resolver
  , Gaze       = require('gaze').Gaze;

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

    wss.on('open', function () {
        console.log('connected');
    });

    wss.on('connection', function (ws) {
        var clientId = ++uniqueId;

        ws.on('open', function () {
            console.log('client #%d connected', clientId);
        });

        ws.on('message', function (msg) {
            var data  = JSON.parse(msg);

            watched = {};
            data.forEach(function (e) {
                var path = resolver.resolvePath(e.url);
                if (fs.existsSync(path)) {
                    watched[path] = e;
                } else {
                    console.log('client #%d file %s not found', clientId, path);
                }
            });

            if (watchers[clientId]) {
                watchers[clientId].close();
            }

            watchers[clientId] = new Gaze(Object.keys(watched), null, function (err) {
                if (err) {
                    console.log('client #%d failed to start watcher', clientId);
                    console.log(err.stack || err);
                    return;
                } else {
                    console.log('client #%d watcher started', clientId);
                }
                this.on('changed', function (name) {
                    var msg = JSON.stringify(watched[name]);
                    ws.send(msg, function (err) {
                        console.log('client #%d change detected: %s', clientId, name);
                    });
                });
                this.on('error', function (err) {
                    console.log('client #%d watch error', clientId);
                    console.log(err.stack || err);
                });
            });
        });

        ws.on('close', function () {
            console.log('client #%d disconnected', clientId);
            if (watchers[clientId]) {
                watchers[clientId].close();
            }
        });

        ws.on('error', function (err) {
            console.log('client #%d error', clientId);
            console.log(err.stack || err);
        });
    });
};
