(function (exports) {
    var doc    = exports.document
      , loc    = exports.location
      , slice  = Array.prototype.slice
      , head   = elsByTag('head')[0]
      , host   = loc.host
      , map    = Array.prototype.map
      , socket = initializeWebSocket();

    function initializeWebSocket () {
        var el = elsByTag('script')
               .filter(function (el) {
                    return el.src && el.src.match(/rfresh-client/);
                })[0]
          , url = parseUrl(el.src);
        return new WebSocket('ws://' + url.host);
    }

    function parseUrl (url) {
        var el = doc.createElement('a');
        el.href = url;
        return el;
    }

    function elsByTag (tag) {
        return slice.call(doc.getElementsByTagName(tag));
    }

    function createStylesheetEl (href) {
        var el = document.createElement('link');
        el.setAttribute('rel', 'stylesheet');
        el.setAttribute('href', href);
        head.appendChild(el);
        return el;
    }

    function getStylesheetEl (href) {
        return elsByTag('link').filter(function (el) {
            return el.href === href;
        })[0] || createStylesheetEl(href);
    }

    function getScripts () {
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
    }

    function reloadStylesheet (data) {
        var el = getStylesheetEl(data.href)
          , now = 'rfresh_reload=' + Date.now()
          , sep = data.href.indexOf('?') === -1 ? '?' : '&'
          , cacheBust = sep + now;

        el.href = data.href + cacheBust;
    }

    function reloadPage (data) {
        var bypassCache = false;
        loc.reload(bypassCache);
    }

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
