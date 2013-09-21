var path = require('path')
    , util = require('util');

require('colors');

module.exports.readVersion = function () {
  var file = path.join(process.cwd(), 'package.json')
      , data = require(file);
  return data.version;
}

module.exports.usage = function (desc) {
  var file = path.basename(process.argv[1])
      , text = util.isArray(desc) ? desc.join(' ') : desc.cyan;
  return text + ('\nUsage: ' + file + ' [options]').blue;
}
