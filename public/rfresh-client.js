(function (exports) {
    var doc    = exports.document
      , loc    = exports.location
      , head   = doc.getElementsByTagName('head')[0]
      , host   = loc.host
      , slice  = Array.prototype.slice
      , map    = Array.prototype.map
      , socket = new WebSocket('ws://' + host);

    var elsByTag = function (tag) {
            return slice.call(doc.getElementsByTagName(tag));
        };

    var createStylesheetEl = function (href) {
            var el = document.createElement('link');
            el.setAttribute('rel', 'stylesheet');
            el.setAttribute('href', href);
            head.appendChild(el);
            return el;
        };

    var getStylesheetEl = function (href) {
            return elsByTag('link').filter(function (el) {
                return el.href === href;
            })[0] || createStylesheetEl(href);
        };

    var getScripts = function () {
            var els = []
                   .concat(elsByTag('script'))
                   .concat(elsByTag('link'));

            return els
               .map(function (el) {
                    var path = el.href || el.src;

                    return {
                        href : path
                      , url  : path.replace(loc.origin, '')
                      , type : el.type
                      , tag  : el.tagName
                    }
                })
               .filter(function (el) {
                    return !el.url.match(/rfresh-client/);
                })
        };

    var reloadStylesheet = function (data) {
            var el = getStylesheetEl(data.href)
              , now = 'rfresh_reload=' + Date.now()
              , sep = data.href.indexOf('?') === -1 ? '?' : '&'
              , cacheBust = sep + now;

            el.href = data.href + cacheBust;
        };

    var reloadPage = function (data) {
            var bypassCache = false;
            loc.reload(bypassCache);
        };

    exports.getScripts = getScripts;

    socket.onopen = function (e) {
        var scripts = getScripts()
          , data    = JSON.stringify(scripts);
        socket.send(data);
    };

    socket.onmessage = function (e) {
        var data = JSON.parse(e.data);

        if (data.tag === 'LINK') {
            reloadStylesheet(data);
        } else {
            reloadPage(data);
        }
    };
})(window);
