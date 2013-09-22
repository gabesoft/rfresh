var path = require('path');

function getRewriter (rewrite) {
    if (!rewrite) {
        return function (url) {
            return url;
        };
    }

    var parts       = rewrite.split(':')
      , regex       = null
      , replacement = null;

    if (parts.length === 2) {
        regex = new RegExp(parts[0]);
        replacement = parts[1];

        console.log(regex, replacement);
        return function (url) {
            return url.replace(regex, replacement);
        };
    }

    throw new Error('Rewrite must be of the form regex:replacement');
}

function Resolver (dir, rewrite) {
    this.dir     = path.resolve(dir);
    this.rewrite = getRewriter(rewrite);
}

Resolver.prototype.resolvePath = function(url) {
    url = url.replace(/\?.+/, '');
    url = this.rewrite(url);
    return path.join(this.dir, url);
};

exports.Resolver = Resolver;

