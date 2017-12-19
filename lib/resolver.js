const path = require('path');
const util = require('util');

function processRewrite (rewrite) {
  const replace = [];

  rewrite.forEach(function (r) {
    var parts = r.split('::');
    if (parts.length === 2) {
      replace.push({
        regex       : new RegExp(parts[0])
        , replacement : parts[1]
      });
    } else {
      console.log('invalid rewrite: ' + r);
    }
  });

  return replace;
}

function getRewriter (rewrite) {
  if (rewrite.length === 0) {
    return function (url) {
      return url;
    };
  }

  const repl = processRewrite(rewrite);

  return function (url) {
    repl.forEach(function (r) {
      url = url.replace(r.regex, r.replacement);
    });
    return url;
  };
}

function Resolver (dir, rewrite) {
  rewrite = rewrite || [];
  rewrite = util.isArray(rewrite) ? rewrite : [ rewrite ];
  this.dir     = path.resolve(dir);
  this.rewrite = getRewriter(rewrite);
}

Resolver.prototype.resolvePath = function(input) {
  const url = this.rewrite(input.replace(/\?.+/, ''));
  return path.join(this.dir, url);
};

exports.Resolver = Resolver;
