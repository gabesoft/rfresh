var WSServer = require('ws').Server
  , path     = require('path')
  , http     = require('http')
  , express  = require('express')
  , app      = express()
  , server   = null
  , wss      = null
  , port     = 8080; // TODO: make port configurable

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.logger('dev'));
app.use(express.bodyParser());

server = http.createServer(app);
server.listen(port, function() {
    console.log('server started on port: ' + port);
});

wss = new WSServer({ server: server });
wss.on('connection', function (ws) {
    var id = setInterval(function () {
            var data = JSON.stringify(process.memoryUsage());
            ws.send(data, function (err) {
                //console.log('data sent', err);
            });
        }, 100);

    console.log('started client interval');
    ws.on('close', function () {
        console.log('stopping client interval');
        clearInterval(id);
    });
});

//http://community.topcoder.com/tc?module=ProblemArchive&sr=51&er=100&sc=&sd=&class=&cat=&div1l=1&div2l=&mind1s=&mind2s=&maxd1s=&maxd2s=&wr=
//http://community.topcoder.com/stat?c=problem_statement&pm=11809
//http://community.topcoder.com/tc?module=Static&d1=tutorials&d2=binarySearch
//http://community.topcoder.com/tc?module=Static&d1=tutorials&d2=integersReals
//http://en.wikipedia.org/wiki/Huffman_coding
//https://github.com/livereload/livereload-js/blob/master/dist/livereload.js
//http://cssrefresh.frebsite.nl/
//http://cssrefresh.frebsite.nl/js/cssrefresh.js
//http://stackoverflow.com/questions/2024486/is-there-an-easy-way-to-reload-css-without-reloading-the-page
//http://stackoverflow.com/questions/13721183/reload-css-stylesheets-with-javascript
//http://www.youtube.com/watch?v=bntNYzCrzvE
//https://developer.mozilla.org/en-US/docs/WebSockets/Writing_WebSocket_client_applications
//https://github.com/einaros/ws
