const WSServer   = require('ws').Server;
const fs         = require('fs');
const http       = require('http');
const path       = require('path');
const handlebars = require('handlebars');
const express    = require('express');
const Resolver   = require('./resolver').Resolver;
const chokidar   = require('chokidar');
const morgan = require('morgan');

require('colors');

exports.start = function(options, cb) {
  const port     = options.port;
  const app      = express();
  const rewrite  = options.rewrite;
  const dir      = options.watchDir;
  const resolver = new Resolver(dir, rewrite);
  const watchers = {};

  let server   = null;
  let uniqueId = 1;

  app.use(morgan('dev'));
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
    const clientId = ++uniqueId;

    function closeWatcher () {
      if (watchers[clientId]) {
        watchers[clientId].close();
        watchers[clientId] = null;
      }
    }

    function log () {
      const args = Array.prototype.slice.call(arguments);
      const msg = ('client #' + clientId).grey + ' ' + args[0];
      const rest = args.slice(1);
      console.log.apply(console, [msg].concat(rest));
    }

    ws.on('open', function () {
      log('connected');
    });

    ws.on('message', function (msg) {
      const data = JSON.parse(msg);
      const items = {};

      let paths = [];

      closeWatcher();

      data.forEach(function (e) {
        const path = resolver.resolvePath(e.url);

        if (fs.existsSync(path)) {
          items[path] = e;
        } else {
          log('file not found '.yellow + path.green);
        }
      });

      paths = Object.keys(items);

      watchers[clientId] = chokidar.watch();
      watchers[clientId].on('change', function (name) {
        let msg = null;
        if (!items[name]) {
          log('no client data found for ' + name.red);
        } else {
          msg = JSON.stringify(items[name]);
          ws.send(msg, function (err) {
            log('change detected ' + name.green);
          });
        }
      });

      watchers[clientId].add(paths);
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
