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
      , resolver = new Resolver(dir, rewrite)
      , watcher  = null
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
        ws.on('message', function (msg) {
            var data  = JSON.parse(msg);

            watched = {};
            data.forEach(function (e) {
                var path = resolver.resolvePath(e.url);
                if (fs.existsSync(path)) {
                    watched[path] = e;
                } else {
                    console.log('file ' + path + ' not found');
                }
            });

            watcher && watcher.close();
            watcher = new Gaze(Object.keys(watched), null, function (err) {
                if (err) {
                    console.log('failed to start watcher', err.stack || err);
                    return;
                } else {
                    console.log('watcher started');
                }
                this.on('changed', function (name) {
                    var msg = JSON.stringify(watched[name]);
                    ws.send(msg, function (err) {
                        console.log('change detected: ' + name);
                    });
                });
            });
        });
    });
};
