var util   = require('./util')
  , fs     = require('fs')
  , params = require('optimist')
       .usage(util.usage('Starts the rfresh server'))
       .alias('p', 'port').describe('p', 'server port (defaults to 8080)')
       .alias('d', 'dir').describe('d', 'path to the directory to watch (defaults to the current directory)')
       .alias('r', 'rewrite').describe('r', 'rewrite path in the format "regex:replacement"')
       .alias('h', 'help').describe('h', 'displays usage').boolean('h')
       .alias('v', 'version').describe('v', 'displays current version').boolean('v')
  , argv     = params.argv
  , port     = argv.port || 8080
  , watchDir = argv.dir || process.cwd()
  , server   = require('./server');

if (argv.help) {
    console.log(params.help());
    process.exit(0);
}

if (argv.version) {
    console.log(require('../package.json').version);
    process.exit(0);
}

fs.stat(watchDir, function(err, stats) {
    if (stats && stats.isDirectory()) {
        server.start({
            port     : port
          , watchDir : watchDir
          , rewrite  : argv.rewrite
        }, function () {
            console.log('rfresh server started on port ' + port);
        });
    } else {
        console.log('a directory named ' + watchDir + ' does not exist');
    }
});