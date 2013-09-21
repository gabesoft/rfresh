(function (exports) {
  var doc = exports.document
      , loc = exports.location
      , host = loc.host
      , slice = Array.prototype.slice
      , map = Array.prototype.map
      , socket = new WebSocket('ws://' + host);

  var elsByTag = function (tag) {
        return doc.getElementsByTagName(tag);
    };

  var getScripts = function () {
        var els = []
            .concat(slice.call(elsByTag('script')))
            .concat(slice.call(elsByTag('link')));

        return els
          .map(function (el) {
            var path = el.href || el.src;

            return {
              path: path.replace(loc.origin, '')
              , type: el.type
              , tag: el.tagName
            }
          })
          .filter(function (el) {
            return !el.path.match(/rfresh-client/);
          })
    };

  exports.getScripts = getScripts;

  socket.onopen = function (e) {
    var data = JSON.stringify(getScripts());
    socket.send(data);
  };

  socket.onmessage = function (e) {
    console.log(e.data);
  };
})(window);
