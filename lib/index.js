const util = require('./util');
const fs = require('fs');
const posix = require('posix');
const params = require('optimist')
      .usage(util.usage('Start the rfresh server'))
      .alias('p', 'port').describe('p', 'server port (defaults to 8080)')
      .alias('d', 'dir').describe('d', 'path to the directory to watch (defaults to the current directory)')
      .alias('r', 'rewrite').describe('r', 'rewrite path in the format "regex::replacement"')
      .alias('x', 'external').describe('x', 'allow external client scripts').boolean('x')
      .alias('l', 'delay').describe('l', 'client script load delay in ms')
      .alias('h', 'help').describe('h', 'displays usage').boolean('h')
      .alias('t', 'type').describe('t', 'type of tags to reload [link or script] (defaults to link,script)')
      .alias('c', 'cssrefresh').describe('c', 'refresh page on css changes (as opposed to just reloading the stylesheet)').boolean('c')
      .alias('m', 'rlimit').describe('m', 'set resource limits if necessary (check with "ulimit -a")')
      .alias('v', 'version').describe('v', 'displays current version').boolean('v');
const argv = params.argv;
const port = argv.port || 8080;
const rlimit = argv.rlimit;
const watchDir = argv.dir || process.cwd();
const server = require('./server');

if (argv.help) {
  console.log(params.help());
  process.exit(0);
}

if (argv.version) {
  console.log(require('../package.json').version);
  process.exit(0);
}

if (rlimit) {
  posix.setrlimit('nofile', { soft: rlimit, hard: rlimit });
}

fs.stat(watchDir, function(err, stats) {
  if (stats && stats.isDirectory()) {
    server.start({
      port,
      watchDir,
      rewrite: argv.rewrite,
      type: argv.type || 'link,script',
      allowExternal: argv.external || "false",
      cssRefresh: argv.cssrefresh,
      delay: argv.delay || 0
    }, function () {
      console.log('rfresh server started on port ' + port);
    });
  } else {
    console.log('a directory named ' + watchDir + ' does not exist');
  }
});
