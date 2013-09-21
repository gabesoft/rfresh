(function (exports) {
    var doc    = exports.document
      , loc    = exports.location
      , host   = loc.host
      , slice  = Array.prototype.slice
      , map    = Array.prototype.map
      , socket = new WebSocket('ws://' + host);

    var elsByTag = function (tag) {
            return slice.call(doc.getElementsByTagName(tag));
        };

    var getScripts = function () {
            var els = []
                   .concat(elsByTag('script'))
                   .concat(elsByTag('link'));

            return els
               .map(function (el) {
                    var path = el.href || el.src;

                    return {
                        url  : path.replace(loc.origin, '')
                      , type : el.type
                      , tag  : el.tagName
                    }
                })
               .filter(function (el) {
                    return !el.url.match(/rfresh-client/);
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
